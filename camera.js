let mForward = false
let mBackward = false
let mRight = false
let mLeft = false
let mUp = false
let mDown = false

/**
 * Binds movement keys to keypress down.
 * @param {KeyboardEvent} e
 */
const onKeyDown = function (e) {
    switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
        mForward = true
        break
    case 'ArrowDown':
    case 'KeyS':
        mBackward = true
        break
    case 'ArrowRight':
    case 'KeyD':
        mRight = true
        break
    case 'ArrowLeft':
    case 'KeyA':
        mLeft = true
        break
    case 'ShiftRight':
    case 'KeyQ':
    case 'Space':
        mUp = true
        break
    case 'ControlLeft':
    case 'KeyE':
        mDown = true
    }
}

/**
 * Binds movement keys to keypress up.
 * @param {KeyboardEvent} e
 */
const onKeyUp = function (e) {
    switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
        mForward = false
        break
    case 'ArrowDown':
    case 'KeyS':
        mBackward = false
        break
    case 'ArrowRight':
    case 'KeyD':
        mRight = false
        break
    case 'ArrowLeft':
    case 'KeyA':
        mLeft = false
        break
    case 'ShiftRight':
    case 'KeyQ':
    case 'Space':
        mUp = false
        break
    case 'ControlLeft':
    case 'KeyE':
        mDown = false
    }
}

/**
 * Binds the movement keys to keypresses.
 */
function bindListeners () {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
}

/**
 * True iff keypresses indicate forward movement.
 * @returns {boolean}
 */
function isForward () {
    return mForward
}

/**
 * True iff keypresses indicate backward movement.
 * @returns {boolean}
 */
function isBackward () {
    return mBackward
}

/**
 * True iff keypresses indicate right movement.
 * @returns {boolean}
 */
function isRight () {
    return mRight
}

/**
 * True iff keypresses indicate left movement.
 * @returns {boolean}
 */
function isLeft () {
    return mLeft
}

/**
 * True iff keypresses indicate upwards movement.
 * @returns {boolean}
 */
function isUp () {
    return mUp
}

/**
 * True iff keypresses indicate downwards movement.
 * @returns {boolean}
 */
function isDown () {
    return mDown
}

export { bindListeners, isForward, isBackward, isRight, isLeft, isUp, isDown }
