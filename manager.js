import * as THREE from 'three'
import { BACKGROUND } from 'universe'
import { RenderPass } from 'renderpass'
import { UnrealBloomPass } from 'unrealbloompass'
import { EffectComposer } from 'effectcomposer'
import { bindListeners, isBackward, isDown, isForward, isLeft, isRight, isUp } from 'camera'
import { PointerLockControls } from 'pointerlockcontrols'
import { SUN } from 'solarsystem'

const TIME_SCALE = 1e0
const MOVE_SCALE = 7 * 1e0
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
 * @param {THREE.Mesh} [parentMesh=null] used if the cb should be the child of another mesh
 */
function addBodyToScene (cb, scene, parentMesh = null) {
    parentMesh ??= scene
    if (cb === null || scene === null) {
        return
    }
    const geo = new THREE.SphereGeometry(cb.radius(0), SPHERE_PARAMS.widthSegments, SPHERE_PARAMS.heightSegments)
    const body = new THREE.Mesh(geo, cb.material)
    const cbLoc = cb.location(0)
    body.position.set(cbLoc.x, cbLoc.y, cbLoc.z)

    if (cb.light !== null) {
        cb.light.position.set(cbLoc.x, cbLoc.y, cbLoc.z)
        parentMesh.add(cb.light)
    }
    if (cb.children !== null) {
        const children = cb.getChildren()
        const cLen = children.length
        for (let i = 0; i < cLen; i++) {
            addBodyToScene(children[i], scene, body)
        }
    }
    body.name = cb.name
    parentMesh.add(body)
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
    systemComposer = new EffectComposer(systemRenderer)
    systemComposer.addPass(renderPass)
    systemComposer.setPixelRatio(window.devicePixelRatio)
}

function renderBody (cb, mesh, time, parent = null) {
    parent ??= mesh
    const cbLoc = parent.localToWorld(cb.location(time))
    mesh.position.set(cbLoc.x, cbLoc.y, cbLoc.z)
    if (cb.children !== null) {
        const children = cb.getChildren()
        const cLen = children.length
        for (let i = 0; i < cLen; i++) {
            renderBody(children[i], systemScene.getObjectByName(children[i].name), time, mesh)
        }
    }
}

/**
 * render is called each animation frame, and advances the state of the universe.
 */
function render () {
    const dTime = clock.getDelta() / TIME_SCALE
    requestAnimationFrame(render)
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
