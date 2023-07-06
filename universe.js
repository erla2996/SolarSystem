import * as THREE from 'three'

const N = 1e3
const DIST = 1e3
const UNIFORMS = { pointTexture: { value: new THREE.TextureLoader().load('images/star.png') } }

/**
 * Class for the data of the background stars.
 */
class Background {
    /**
     * Constructor for a background object.
     * @param {HTMLCanvasElement} canvas
     * @param {number} nStars
     * @param {number[]} starPos
     * @param {number[]} starSize
     * @param {THREE.ShaderMaterial} starShader
     * @param {THREE.Color} starColour
     */
    constructor (canvas, nStars, starPos, starSize, starShader, starColour) {
        this.canvas = canvas
        this.n_stars = nStars
        this.star_pos = starPos
        this.star_size = starSize
        this.star_shader = starShader
        this.star_colour = starColour
        if (this.star_colour instanceof THREE.Color) {
            this.star_colour = Array(this.n_stars).fill(this.star_colour)
        }
    }
}

const colours = []
const colour = new THREE.Color()
const positions = []
const sizes = []
for (let i = 0; i < N; i++) {
    colour.setHSL(200, 1.0, 80 + Math.random() * 10)
    colours.push(colour.r, colour.g, colour.b)
    // position stars in a sphere around the origin
    // see http://corysimon.github.io/articles/uniformdistn-on-sphere/
    const theta = 2 * Math.PI * Math.random()
    const phi = Math.acos(1 - 2 * Math.random())
    positions.push(Math.sin(phi) * Math.cos(theta) * DIST) // x
    positions.push(Math.sin(phi) * Math.sin(theta) * DIST) // y
    positions.push(Math.cos(phi) * DIST) // z
    sizes.push(Math.random() * 20)
}

const BACKGROUND = new Background(
    document.getElementById('background'),
    N,
    positions,
    sizes,
    new THREE.ShaderMaterial({
        uniforms: UNIFORMS,
        vertexShader: `
        attribute float size;

        varying vec3 vColor;

        void main() {

            vColor = color;

            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

            gl_PointSize = size * ( 300.0 / -mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;

        }
        `,
        fragmentShader: `
        uniform sampler2D pointTexture;

        varying vec3 vColor;

        void main() {

            gl_FragColor = vec4( vColor, 1.0 );
            gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );

        }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    }),
    colours
)

export { BACKGROUND }
