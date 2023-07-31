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
    new THREE.MeshBasicMaterial({ map: textures.SUN }),
    light,
    document.getElementById('c')
)
const MERCURY = new CelestialBody(
    'MERCURY',
    time => {
        const coords = getPlanetPosition('MERCURY', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 1.63083872 * 1e-5
    },
    new THREE.MeshStandardMaterial({ map: textures.MERCURY }),
    null,
    null
)
const VENUS = new CelestialBody(
    'VENUS',
    time => {
        const coords = getPlanetPosition('VENUS', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 4.04537843 * 1e-5
    },
    new THREE.MeshStandardMaterial({ map: textures.VENUS }),
    null,
    null
)
const EARTH = new CelestialBody(
    'EARTH',
    time => {
        const coords = getPlanetPosition('EARTH', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 4.25875 * 1e-5
    },
    new THREE.MeshStandardMaterial({ map: textures.EARTH }),
    null,
    null
)
const MARS = new CelestialBody(
    'MARS',
    time => {
        const coords = getPlanetPosition('MARS', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 2.26574081 * 1e-5
    },
    new THREE.MeshStandardMaterial({ map: textures.MARS }),
    null,
    null
)
const JUPITER = new CelestialBody(
    'JUPITER',
    time => {
        const coords = getPlanetPosition('JUPITER', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 0.00046732617
    },
    new THREE.MeshStandardMaterial({ map: textures.JUPITER }),
    null,
    null
)
const SATURN = new CelestialBody(
    'SATURN',
    time => {
        const coords = getPlanetPosition('SATURN', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 0.00038925688
    },
    new THREE.MeshStandardMaterial({ map: textures.SATURN }),
    null,
    null
)
const URANUS = new CelestialBody(
    'URANUS',
    time => {
        const coords = getPlanetPosition('URANUS', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 0.0001695345
    },
    new THREE.MeshStandardMaterial({ map: textures.URANUS }),
    null,
    null
)
const NEPTUNE = new CelestialBody(
    'NEPTUNE',
    time => {
        const coords = getPlanetPosition('NEPTUNE', time * TIME_SCALE)
        return new THREE.Vector3(SCALE * coords[0], SCALE * coords[1], SCALE * coords[2])
    },
    time => {
        return SCALE * 0.0001645879
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
