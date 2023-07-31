import * as THREE from 'three'
import { getPlanetPosition } from 'vsop87'

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
 * Callback type for a celestial body's rotation, as a function of time.
 * @callback rotationCallback
 * @param {number} time
 * @returns {number} - the body's rotation in radians
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
     * @param {diameterCallback} radius
     * @param {rotationCallback} rotation
     * @param {THREE.ShaderMaterial} material
     * @param {THREE.DirectionalLight} [light=null]
     * @param {HTMLCanvasElement} [canvas=null]
     */
    constructor (name, location, radius, rotation, material,
        up = new THREE.Vector3(0, 1, 0), light = null, canvas = null) {
        this.name = name
        this.location = location
        this.radius = radius
        this.rotation = rotation
        this.material = material
        this.up = up
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
     * Pushes newChild onto the array of the object's children.
     * @param {CelestialBody} newChild
     */
    addChild (newChild) {
        this.children.push(newChild)
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
const SCALE = 1e2
const TIME_SCALE = 1e0

const light = new THREE.PointLight(0xFFFFFF, 1)
const SUN = new CelestialBody(
    'SUN',
    time => {
        return new THREE.Vector3(0, 0, 0)
    },
    time => {
        return SCALE * 0.00465047
    },
    time => {
        // The sun's rotation varies with its latitude, since it is not a solid body.
        // To keep this code simple, a sidereal rotation of 25.38 days is used (Carrington rotation).
        // The sun's rotation is counterclockwise.
        return TIME_SCALE * (time % 25.38) / 25.38 * (Math.PI * 2)
    },
    new THREE.MeshBasicMaterial({ map: textures.SUN }),
    new THREE.Vector3(0, Math.cos(0.127), 0),
    light,
    document.getElementById('c')
)
const MERCURY = new CelestialBody(
    'MERCURY',
    time => {
        const coords = getPlanetPosition('MERCURY', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 1.63083872 * 1e-5
    },
    time => {
        return TIME_SCALE * (time % 58.646) / 58.646 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.MERCURY }),
    new THREE.Vector3(0, Math.cos(0.001), 0),
    null,
    null
)
const VENUS = new CelestialBody(
    'VENUS',
    time => {
        const coords = getPlanetPosition('VENUS', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 4.04537843 * 1e-5
    },
    time => {
        return TIME_SCALE * -(time % 116.75) / 116.75 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.VENUS }),
    new THREE.Vector3(0, Math.cos(0.046), 0),
    null,
    null
)
const EARTH = new CelestialBody(
    'EARTH',
    time => {
        const coords = getPlanetPosition('EARTH', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 4.25875 * 1e-5
    },
    time => {
        return TIME_SCALE * (time % 0.997) / 0.997 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.EARTH }),
    new THREE.Vector3(0, Math.cos(0.409), 0),
    null,
    null
)
const MARS = new CelestialBody(
    'MARS',
    time => {
        const coords = getPlanetPosition('MARS', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 2.26574081 * 1e-5
    },
    time => {
        return TIME_SCALE * (time % 1.026) / 1.026 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.MARS }),
    new THREE.Vector3(0, Math.cos(0.430), 0),
    null,
    null
)
const JUPITER = new CelestialBody(
    'JUPITER',
    time => {
        const coords = getPlanetPosition('JUPITER', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 0.00046732617
    },
    time => {
        return TIME_SCALE * (time % 0.414) / 0.414 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.JUPITER }),
    new THREE.Vector3(0, Math.cos(0.055), 0),
    null,
    null
)
const SATURN = new CelestialBody(
    'SATURN',
    time => {
        const coords = getPlanetPosition('SATURN', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 0.00038925688
    },
    time => {
        return TIME_SCALE * (time % 0.440) / 0.440 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.SATURN }),
    new THREE.Vector3(0, Math.cos(0.467), 0),
    null,
    null
)
const URANUS = new CelestialBody(
    'URANUS',
    time => {
        const coords = getPlanetPosition('URANUS', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 0.0001695345
    },
    time => {
        return TIME_SCALE * -(time % 0.718) / 0.718 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.URANUS }),
    new THREE.Vector3(0, Math.cos(1.706), 0),
    null,
    null
)
const NEPTUNE = new CelestialBody(
    'NEPTUNE',
    time => {
        const coords = getPlanetPosition('NEPTUNE', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[2], SCALE * coords[1])
    },
    time => {
        return SCALE * 0.0001645879
    },
    time => {
        return TIME_SCALE * (time % 0.671) / 0.671 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.NEPTUNE }),
    new THREE.Vector3(0, Math.cos(0.494), 0),
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
