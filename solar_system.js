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

const light = new THREE.PointLight(0xFFFFFF, 1)
const SUN = new CelestialBody(
    'SUN',
    time => {
        return new THREE.Vector3(0, 0, 0)
    },
    time => {
        return 1
    },
    new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFFFFFF, emissiveIntensity: 0.2 }),
    light,
    document.getElementById('c')
)
const MERCURY = new CelestialBody(
    'MERCURY',
    time => {
        return new THREE.Vector3(3, 1 + Math.sin(time), 3)
    },
    time => {
        return 0.5
    },
    new THREE.MeshStandardMaterial({ color: 0xFF0000 }),
    null,
    null
)

SUN.addChild(MERCURY)

export { SUN }
