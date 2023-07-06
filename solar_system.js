import * as THREE from 'three'

/**
 * Callback type for a celestial body's location, as a function of time.
 * @callback locationCallback
 * @param {number} time
 * @returns {THREE.Vector3}
 */

/**
 * Callback type for a celestial body's diameter, as a function of time.
 * @callback diameterCallback
 * @param {number} time
 * @returns {number}
 */

/**
 * Class for a celestial body, such as a star or a planet.
 * Notably, each celestial body can have one or several children. For example, a star would likely
 * have one or several planets as children.
 */
class CelestialBody {
    /**
     * Constructor for a celestial body.
     * @param {string} name - Needs to be unique.
     * @param {locationCallback} location - Relative to the parent celestial body
     * @param {diameterCallback} radius - Negative/null iff the celestial body has no physical representation,
     *  and is only used for container/structuring purposes.
     * @param {THREE.ShaderMaterial} material
     * @param {THREE.DirectionalLight} [light=null]
     * @param {HTMLCanvasElement} [canvas=null]
     */
    constructor (name, location, radius, material, light = null, canvas = null) {
        this.name = name
        this.location = location
        this.radius = radius
        this.material = material
        this.light = light
        this.children = []
        this.canvas = canvas
    }

    /**
     * Gets the child celestial bodies, as an array.
     * @returns {CelestialBody[]} Array of child bodies
     */
    getChildren () {
        return this.children
    }

    /**
     * Inserts newChild into the array of the object's children.
     * @param {CelestialBody} newChild
     * @param {number} index
     */
    addChild (newChild, index = -1) {
        this.children.splice(index, 0, newChild)
    }

    /**
     * Removes the child celestial body at the passed index.
     * @param {number} index
     * @returns {CelestialBody} The removed child
     */
    removeChild (index = -1) {
        return this.children.splice(index, 1)
    }
}

const textures = {
    SUN: new THREE.TextureLoader().load('images/2k_sun.jpg'),
    MERCURY: new THREE.TextureLoader().load('images/2k_mercury.jpg'),
    VENUS: new THREE.TextureLoader().load('images/2k_venus_atmosphere.jpg'),
    EARTH: new THREE.TextureLoader().load('images/2k_earth_daymap.jpg'),
    MARS: new THREE.TextureLoader().load('images/2k_mars.jpg'),
    JUPITER: new THREE.TextureLoader().load('images/2k_jupiter.jpg'),
    SATURN: new THREE.TextureLoader().load('images/2k_saturn.jpg'),
    URANUS: new THREE.TextureLoader().load('images/2k_uranus.jpg'),
    NEPTUNE: new THREE.TextureLoader().load('images/2k_neptune.jpg')
}

const light = new THREE.PointLight(0xFFFFFF, 1)
const SUN = new CelestialBody(
    'SUN',
    time => {
        return new THREE.Vector3(0, 0, 0)
    },
    time => {
        return 1
    },
    new THREE.MeshBasicMaterial({ map: textures.SUN }),
    light,
    document.getElementById('c')
)
const MERCURY = new CelestialBody(
    'MERCURY',
    time => {
        return new THREE.Vector3(3, 1 + Math.sin(time), 3)
    },
    time => {
        return 0.25
    },
    new THREE.MeshStandardMaterial({ map: textures.MERCURY }),
    null,
    null
)
const VENUS = new CelestialBody(
    'VENUS',
    time => {
        return new THREE.Vector3(5, Math.sin(time / 2), 5)
    },
    time => {
        return 0.5
    },
    new THREE.MeshStandardMaterial({ map: textures.VENUS }),
    null,
    null
)
const EARTH = new CelestialBody(
    'EARTH',
    time => {
        return new THREE.Vector3(7, Math.sin(2 * time), 7)
    },
    time => {
        return 0.5
    },
    new THREE.MeshStandardMaterial({ map: textures.EARTH }),
    null,
    null
)
const MARS = new CelestialBody(
    'MARS',
    time => {
        return new THREE.Vector3(9, Math.sin(2 * time), 9)
    },
    time => {
        return 0.25
    },
    new THREE.MeshStandardMaterial({ map: textures.MARS }),
    null,
    null
)
const JUPITER = new CelestialBody(
    'JUPITER',
    time => {
        return new THREE.Vector3(11, Math.sin(2 * time), 11)
    },
    time => {
        return 0.8
    },
    new THREE.MeshStandardMaterial({ map: textures.JUPITER }),
    null,
    null
)
const SATURN = new CelestialBody(
    'SATURN',
    time => {
        return new THREE.Vector3(13, Math.sin(2 * time), 13)
    },
    time => {
        return 0.7
    },
    new THREE.MeshStandardMaterial({ map: textures.SATURN }),
    null,
    null
)
const URANUS = new CelestialBody(
    'URANUS',
    time => {
        return new THREE.Vector3(15, Math.sin(2 * time), 15)
    },
    time => {
        return 0.5
    },
    new THREE.MeshStandardMaterial({ map: textures.URANUS }),
    null,
    null
)
const NEPTUNE = new CelestialBody(
    'NEPTUNE',
    time => {
        return new THREE.Vector3(17, Math.sin(2 * time), 17)
    },
    time => {
        return 0.5
    },
    new THREE.MeshStandardMaterial({ map: textures.NEPTUNE }),
    null,
    null
)

SUN.addChild(MERCURY)
SUN.addChild(VENUS)
SUN.addChild(EARTH)
SUN.addChild(MARS)
SUN.addChild(JUPITER)
SUN.addChild(SATURN)
SUN.addChild(URANUS)
SUN.addChild(NEPTUNE)

export { SUN }
