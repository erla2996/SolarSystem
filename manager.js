import * as THREE from 'three'
import { BACKGROUND } from 'universe'
import { RenderPass } from 'renderpass'
import { OutlinePass } from 'outlinepass'
import { UnrealBloomPass } from 'unrealbloompass'
import { EffectComposer } from 'effectcomposer'
import { bindListeners, isBackward, isDown, isForward, isLeft, isRight, isUp } from 'camera'
import { PointerLockControls } from 'pointerlockcontrols'
import { SUN } from 'solarsystem'

const FPSUPDATEINTERVAL = 0.2

const TIME_SCALE = 1e0
const MOVE_SCALE = 5 * 1e0
const FRICTION = 1e1
const ACCELERATION = 1e1

const CAMERA_PARAMS = {
    fov: 40,
    aspect: 2,
    near: 1,
    far: 10000,
    startPos: new THREE.Vector3(10, 0, 10)
}

const SPHERE_PARAMS = {
    widthSegments: 32,
    heightSegments: 32
}

const selectedBodies = []

const fpsCounter = document.getElementById('fpsCounter')
const fpsClock = new THREE.Clock()

const infoPanel = document.getElementById('infoPanel')

let clock
let velocity
let direction

let bgRenderer
let bgScene
let camera
let bgComposer
let controls

let systemRenderer
let systemScene
let systemComposer

/**
 * Sets up the part of the environment that is used by both the background and the starsystems.
 */
function setup () {
    clock = new THREE.Clock()
    velocity = new THREE.Vector3(0, 0, 0)
    direction = new THREE.Vector3(0, 0, 0)

    camera = new THREE.PerspectiveCamera(CAMERA_PARAMS.fov, CAMERA_PARAMS.aspect,
        CAMERA_PARAMS.near, CAMERA_PARAMS.far)
    camera.position.x = CAMERA_PARAMS.startPos.x
    camera.position.y = CAMERA_PARAMS.startPos.y
    camera.position.z = CAMERA_PARAMS.startPos.z

    document.addEventListener('click', function () {
        controls.lock()
    })
    bindListeners()

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        systemRenderer.setSize(window.innerWidth, window.innerHeight)
        bgRenderer.setSize(window.innerWidth, window.innerHeight)
    },
    false
    )
}

/**
 * Sets up the part of the environment that is used by the background.
 */
function setupBackground () {
    const bg = BACKGROUND
    const canvas = bg.canvas

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    bgRenderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    bgScene = new THREE.Scene()
    bgScene.background = null

    const bgGeometry = new THREE.BufferGeometry()
    bgGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bg.star_pos, 3))
    bgGeometry.setAttribute('color', new THREE.Float32BufferAttribute(bg.star_colour, 3))
    bgGeometry.setAttribute('size', new THREE.Float32BufferAttribute(bg.star_size, 1).setUsage(THREE.DynamicDrawUsage))
    const background = new THREE.Points(bgGeometry, bg.star_shader)
    bgScene.add(background)

    const renderPass = new RenderPass(bgScene, camera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.innerWidth, canvas.innerHeight))
    bloomPass.threshold = 0
    bloomPass.strength = 1.5
    bloomPass.radius = 0

    bgComposer = new EffectComposer(bgRenderer)
    bgComposer.addPass(renderPass)
    bgComposer.addPass(bloomPass)
    bgRenderer.setPixelRatio(window.devicePixelRatio)

    controls = new PointerLockControls(camera, canvas)
}

/**
 * Recursively adds the passed celestial body and its children to the passed scene
 * @param {CelestialBody} cb
 * @param {THREE.Scene} scene
 */
function addBodyToScene (cb, scene) {
    const geo = new THREE.SphereGeometry(cb.radius(0), SPHERE_PARAMS.widthSegments, SPHERE_PARAMS.heightSegments)
    const body = new THREE.Mesh(geo, cb.material)
    const cbLoc = cb.location(0)
    body.position.set(cbLoc.x, cbLoc.y, cbLoc.z)

    if (cb.light !== null) {
        cb.light.position.set(cbLoc.x, cbLoc.y, cbLoc.z)
        scene.add(cb.light)
    }
    if (cb.children !== null) {
        const children = cb.getChildren()
        const cLen = children.length
        for (let i = 0; i < cLen; i++) {
            addBodyToScene(children[i], scene, body)
        }
    }
    body.name = cb.name
    scene.add(body)
}

/**
 * Selects the passed celestial body, and all of its children, using recursion.
 * @param {CelestialBody} root The root object of the tree of objects to select
 */
function selectBodiesRecursively (root) {
    selectedBodies.push(systemScene.getObjectByName(root.name))
    const children = root.getChildren()
    if (children !== null && children.length > 0) {
        for (let i = 0; i < children.length; i++) {
            selectBodiesRecursively(root.children[i])
        }
    }
}

/**
 * Sets up the part of the environment that is used by the solar system(s).
 */
function setupSolarSystem () {
    let canvas = SUN.canvas
    canvas ??= document.getElementById('c')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    systemRenderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    systemScene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(CAMERA_PARAMS.fov, CAMERA_PARAMS.aspect,
        CAMERA_PARAMS.near, CAMERA_PARAMS.far)
    camera.position.x = CAMERA_PARAMS.startPos.x
    camera.position.y = CAMERA_PARAMS.startPos.y
    camera.position.z = CAMERA_PARAMS.startPos.z
    camera.lookAt(new THREE.Vector3(1e-6, 1e-6, 1e-6)) // Not zero, to avoid a singularity

    addBodyToScene(SUN, systemScene)

    const renderPass = new RenderPass(systemScene, camera)
    const outlinePass = new OutlinePass(new THREE.Vector2(canvas.innerWidth, canvas.innerHeight), systemScene, camera)
    // OutlinePass adds outline to child objects as well, so only the root node of the starsystem needs to be added
    selectBodiesRecursively(SUN)
    outlinePass.selectedObjects = selectedBodies
    systemComposer = new EffectComposer(systemRenderer)
    systemComposer.addPass(renderPass)
    systemComposer.addPass(outlinePass)
    systemComposer.setPixelRatio(window.devicePixelRatio)
}

/**
 * Sets the position of the passed celestial body, and all of its children, for the passed time.
 * @param {CelestialBody} cb
 * @param {THREE.Mesh} mesh
 * @param {Number} time
 */
function renderBody (cb, mesh, time) {
    const cbLoc = cb.location(time)
    mesh.position.set(cbLoc.x, cbLoc.y, cbLoc.z)
    mesh.setRotationFromAxisAngle(cb.up, cb.rotation(time))
    if (cb.children !== null) {
        const children = cb.getChildren()
        const cLen = children.length
        for (let i = 0; i < cLen; i++) {
            renderBody(children[i], systemScene.getObjectByName(children[i].name), time, mesh)
        }
    }
}

/**
 * Renders the FPS counter
 * @param {Number} dTime
 */
function renderFPS (dTime) {
    if (fpsClock.getElapsedTime() > FPSUPDATEINTERVAL) {
        fpsClock.start()
        const fps = 'FPS: ' + (1 / dTime).toFixed(0)
        fpsCounter.innerHTML = fps
    }
}

/**
 * Generates an html-string with information about the passed celestial body's current coordinates.
 * @param {CelestialBody} cb
 * @param {THREE.Mesh} cbMesh
 * @returns {string}
 */
function cbCoordinateInfo (cb, cbMesh) {
    let retstring = ''
    retstring += '<p>' + cb.name + ': <span class="ralign">'
    const pos = cbMesh.position
    retstring += '(' + pos.x.toFixed(2) + ', ' +
        pos.y.toFixed(2) + ', ' +
        pos.z.toFixed(2) +
        ')</span></p><br>'
    if (cb.children !== null) {
        const children = cb.getChildren()
        for (let i = 0; i < children.length; i++) {
            const c = children[i]
            retstring += cbCoordinateInfo(c, systemScene.getObjectByName(children[i].name))
        }
    }
    return retstring
}

/**
 * Renders the panel with info about the starsystem and the celestial bodies of the system
 */
function renderInfoPanel () {
    let infoContent = ''
    const time = clock.getElapsedTime()
    infoContent += '<h2>Solarsystem information:</h2><br>'
    infoContent += '<p>Current time: <span class="ralign">' + parseInt(time) + ' days</span></p><br>'
    infoContent += '<p>Camera coordinates: <span class="ralign">' +
        '(' + camera.position.x.toFixed(2) + ', ' +
        camera.position.y.toFixed(2) + ', ' +
        camera.position.z.toFixed(2) +
        ')</span></p><br>'
    infoContent += '<h3>Current coordinates: </h3><br>'
    infoContent += cbCoordinateInfo(SUN, systemScene.getObjectByName(SUN.name))
    infoPanel.innerHTML = infoContent
}

/**
 * render is called each animation frame, and advances the state of the universe.
 */
function render () {
    const dTime = clock.getDelta() / TIME_SCALE
    requestAnimationFrame(render)
    renderFPS(dTime)
    renderInfoPanel()
    if (controls.isLocked) {
        velocity.x -= dTime * FRICTION < 1 ? velocity.x * dTime * FRICTION : 0
        velocity.y -= dTime * FRICTION < 1 ? velocity.y * dTime * FRICTION : 0
        velocity.z -= dTime * FRICTION < 1 ? velocity.z * dTime * FRICTION : 0

        const movement = new THREE.Vector3(isForward() - isBackward(), isUp() - isDown(), isRight() - isLeft())
        if (movement.lengthSq() > 0) {
            const cameraDirection = new THREE.Vector3()
            camera.getWorldDirection(cameraDirection)
            cameraDirection.x = Math.abs(cameraDirection.x)
            cameraDirection.y = Math.abs(cameraDirection.y)
            cameraDirection.z = Math.abs(cameraDirection.z)

            direction.x = cameraDirection.dot(new THREE.Vector3(movement.x, 0, 0))
            direction.y = cameraDirection.dot(new THREE.Vector3(0, movement.y, 0))
            direction.z = cameraDirection.dot(new THREE.Vector3(0, 0, movement.z))
            direction.normalize()

            velocity.x += direction.x * dTime * ACCELERATION
            velocity.y -= direction.y * dTime * ACCELERATION
            velocity.z += direction.z * dTime * ACCELERATION
        }
        controls.moveForward(velocity.x * dTime * MOVE_SCALE)
        controls.moveUp(velocity.y * dTime * MOVE_SCALE)
        controls.moveRight(velocity.z * dTime * MOVE_SCALE)
    }
    renderBody(SUN, systemScene.getObjectByName(SUN.name), clock.getElapsedTime() / TIME_SCALE)

    bgComposer.render()
    systemComposer.render()
}

setup()
setupSolarSystem()
setupBackground()
render()
