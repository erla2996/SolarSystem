import * as THREE from 'three'
import { BACKGROUND } from 'universe'
import { RenderPass } from 'renderpass'
import { UnrealBloomPass } from 'unrealbloompass'
import { EffectComposer } from 'effectcomposer'
import { bindListeners, isBackward, isDown, isForward, isLeft, isRight, isUp } from 'camera'
import { PointerLockControls } from 'pointerlockcontrols'
import { SUN } from 'solarsystem'

const TIME_SCALE = 1e3
const MOVE_SCALE = 1e8
const FRICTION = 1e4
const ACCELERATION = 1e1

const CAMERA_PARAMS = {
    fov: 40,
    aspect: 2,
    near: 1,
    far: 10000,
    startPos: new THREE.Vector3(10, 0, 10)
}

const SPHERE_PARAMS = {
    width_segments: 32,
    height_segments: 32
}

let clock
let velocity
let direction

let background
let bgRenderer
let bgScene
let bgCamera
let bgComposer
let bgControls

let systemRenderer
let systemScene
let systemCamera
let systemComposer

/**
 * Sets up the part of the environment that is used by both the background and the starsystems.
 */
function setup () {
    clock = new THREE.Clock()
    velocity = new THREE.Vector3(0, 0, 0)
    direction = new THREE.Vector3(0, 0, 0)
    bindListeners()
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
    background = new THREE.Points(bgGeometry, bg.star_shader)
    bgScene.add(background)

    bgCamera = new THREE.PerspectiveCamera(CAMERA_PARAMS.fov, CAMERA_PARAMS.aspect,
        CAMERA_PARAMS.near, CAMERA_PARAMS.far)
    bgCamera.position.x = CAMERA_PARAMS.startPos.x
    bgCamera.position.y = CAMERA_PARAMS.startPos.y
    bgCamera.position.z = CAMERA_PARAMS.startPos.z
    bgCamera.lookAt(new THREE.Vector3())

    const renderPass = new RenderPass(bgScene, bgCamera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.innerWidth, canvas.innerHeight))
    bloomPass.threshold = 0
    bloomPass.strength = 1.5
    bloomPass.radius = 0

    bgComposer = new EffectComposer(bgRenderer)
    bgComposer.addPass(renderPass)
    bgComposer.addPass(bloomPass)
    bgRenderer.setPixelRatio(window.devicePixelRatio)

    bgControls = new PointerLockControls(bgCamera, canvas)
    document.addEventListener('click', function () {
        bgControls.lock()
    })
}

/**
 * Sets up the part of the environment that is used by the solar system(s).
 */
function setupSolarSystem () {
    const solarSystem = SUN
    let canvas = SUN.canvas
    canvas ??= document.getElementById('c')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    systemRenderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    systemScene = new THREE.Scene()

    systemCamera = new THREE.PerspectiveCamera(CAMERA_PARAMS.fov, CAMERA_PARAMS.aspect,
        CAMERA_PARAMS.near, CAMERA_PARAMS.far)
    systemCamera.position.x = CAMERA_PARAMS.startPos.x
    systemCamera.position.y = CAMERA_PARAMS.startPos.y
    systemCamera.position.z = CAMERA_PARAMS.startPos.z
    systemCamera.lookAt(new THREE.Vector3())

    const geo = new THREE.SphereGeometry(SUN.radius(0), SPHERE_PARAMS.width_segments, SPHERE_PARAMS.height_segments)
    const body = new THREE.Mesh(geo, SUN.material)
    systemScene.add(body)

    const light = SUN.light
    systemScene.add(light)

    // TODO: break this out into a function, recurse over all children
    const children = solarSystem.getChildren()
    const cLen = children.length
    for (let i = 0; i < cLen; i++) {
        continue
    }

    const renderPass = new RenderPass(systemScene, systemCamera)
    systemComposer = new EffectComposer(systemRenderer)
    systemComposer.addPass(renderPass)
    systemComposer.setPixelRatio(window.devicePixelRatio)
}

/**
 * render is called each animation frame, and advances the state of the universe.
 */
function render () {
    const dTime = clock.getDelta() / TIME_SCALE
    requestAnimationFrame(render)
    if (bgControls.isLocked) {
        velocity.x -= velocity.x * dTime * FRICTION
        velocity.y -= velocity.y * dTime * FRICTION
        velocity.z -= velocity.z * dTime * FRICTION

        direction.x = isForward() - isBackward()
        direction.y = isUp() - isDown()
        direction.z = isRight() - isLeft()
        direction.normalize()

        velocity.x += direction.x * dTime * ACCELERATION
        velocity.y += direction.y * dTime * ACCELERATION
        velocity.z += direction.z * dTime * ACCELERATION

        bgControls.moveForward(velocity.x * dTime * MOVE_SCALE)
        bgControls.moveUp(velocity.y * dTime * MOVE_SCALE)
        bgControls.moveRight(velocity.z * dTime * MOVE_SCALE)
    }
    bgComposer.render()
    systemComposer.render()
}

setup()
setupSolarSystem()
setupBackground()
render()
