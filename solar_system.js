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

const Coords = {
    CELESTIAL: new THREE.Object3D(),
    ECLIPTIC: new THREE.Object3D()
}
Coords.CELESTIAL.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.sin(0.409))
Coords.CELESTIAL.up = new THREE.Vector3(Math.cos(Math.PI / 2.0), Math.cos(0.409), Math.sin(Math.PI / 2.0)).normalize()

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
        return ((time * TIME_SCALE) % 25.38) / 25.38 * (Math.PI * 2)
    },
    new THREE.MeshBasicMaterial({ map: textures.SUN }),
    new THREE.Vector3(Math.cos(-0.961), Math.cos(0.127), Math.sin(-0.961)).normalize(),
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
        return SCALE * 1.63083872 * 1e-5 * 1000
    },
    time => {
        return ((time * TIME_SCALE) % 58.646) / 58.646 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.MERCURY }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(4.905), Math.cos(1.072), Math.cos(4.905))).normalize(),
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
        return SCALE * 4.04537843 * 1e-5 * 1000
    },
    time => {
        return -((time * TIME_SCALE) % 116.75) / 116.75 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.VENUS }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(4.761), Math.cos(1.172), Math.cos(4.761))).normalize(),
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
        return SCALE * 4.25875 * 1e-5 * 1000
    },
    time => {
        return ((time * TIME_SCALE) % 0.997) / 0.997 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.EARTH }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(0), Math.cos(Math.PI / 2), Math.cos(0))).normalize(),
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
        return SCALE * 2.26574081 * 1e-5 * 1000
    },
    time => {
        return ((time * TIME_SCALE) % 1.026) / 1.026 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.MARS }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(5.545), Math.cos(0.923), Math.cos(5.545))).normalize(),
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
        return SCALE * 0.00046732617 * 1000
    },
    time => {
        return ((time * TIME_SCALE) % 0.414) / 0.414 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.JUPITER }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(4.678), Math.cos(1.126), Math.cos(4.678))).normalize(),
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
        return SCALE * 0.00038925688 * 1000
    },
    time => {
        return ((time * TIME_SCALE) % 0.440) / 0.440 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.SATURN }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(0.708), Math.cos(1.458), Math.cos(0.708))).normalize(),
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
        return SCALE * 0.0001695345 * 1000
    },
    time => {
        return -((time * TIME_SCALE) % 0.718) / 0.718 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.URANUS }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(4.491), Math.cos(6.018), Math.cos(4.491))).normalize(),
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
        return SCALE * 0.0001645879 * 1000
    },
    time => {
        return ((time * TIME_SCALE) % 0.671) / 0.671 * (Math.PI * 2)
    },
    new THREE.MeshStandardMaterial({ map: textures.NEPTUNE }),
    Coords.CELESTIAL.localToWorld(new THREE.Vector3(-Math.sin(5.225), Math.cos(0.759), Math.cos(5.225))).normalize(),
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
