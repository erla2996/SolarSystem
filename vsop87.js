const precomputedFiles = [
    'vsop87Computed/VSOP87C.mer.precomp',
    'vsop87Computed/VSOP87C.ven.precomp',
    'vsop87Computed/VSOP87C.ear.precomp',
    'vsop87Computed/VSOP87C.mar.precomp',
    'vsop87Computed/VSOP87C.jup.precomp',
    'vsop87Computed/VSOP87C.sat.precomp',
    'vsop87Computed/VSOP87C.ura.precomp',
    'vsop87Computed/VSOP87C.nep.precomp'
]
const PRECOMPUTED = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1
]
const infiles = [
    'vsop87/VSOP87C.mer',
    'vsop87/VSOP87C.ven',
    'vsop87/VSOP87C.ear',
    'vsop87/VSOP87C.mar',
    'vsop87/VSOP87C.jup',
    'vsop87/VSOP87C.sat',
    'vsop87/VSOP87C.ura',
    'vsop87/VSOP87C.nep'
]
const planetIndex = {
    length: 8,
    MERCURY: 0,
    VENUS: 1,
    EARTH: 2,
    MARS: 3,
    JUPITER: 4,
    SATURN: 5,
    URANUS: 6,
    NEPTUNE: 7
}

/**
 * Reads a file and returns its contents.
 * @param {string} fname The full name or name relative the current directory of the file to read.
 * @returns {string[]} The contents of the file, each element of the array containing a line of the file.
 */
async function readfile (fname) {
    const indata = await fetch(fname)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            return response.blob()
        })
        .then((blob) => {
            return blob.text()
        })
    return indata.split('\n')
}

// precomputedData is an [int[]] containing the precomputed xyz-positions of the planets
// PRECOMPUTED is an int[] containing the number of precomputed values (+1) for each planet
const precomputedData = new Array(planetIndex.length)
for (let i = 0; i < precomputedData.length; i++) {
    precomputedData[i] = await readfile(precomputedFiles[i])
    const header = precomputedData[i].shift()
    PRECOMPUTED[i] = parseInt(header.split(' ').filter(x => { return !isNaN(x) }))
}

// indata is a [string[]], containing the vsop87 data of each planet
const indata = [planetIndex.length]
for (let i = 0; i < infiles.length; i++) {
    indata[i] = readfile(infiles[i])
}

/**
 * Parses a line of vsop87 data and returns the coefficients (three last floats) of the line.
 * @param {string} line
 * @returns {Number[]} Coefficients [A, B, C]
 */
function extractCoefficients (line) {
    return line.split(' ').filter(x => {
        return x.length > 0
    }).slice(-3).map(x => {
        return Number(x)
    })
}

/**
 * Computes the term A * cos(B + CT)
 * @param {*} line A line of vsop87-data, which contains A, B, C as its last 3 numbers.
 * @param {*} T T := (JDE - 2451545) / 365250
 * @returns {Number} The computed term
 */
function computeTerm (line, T) {
    const c = extractCoefficients(line)
    return c[0] * Math.cos(c[1] + c[2] * T)
}

/**
 * Looks up the precomputed xyz-position of the planet with the passed index.
 * @param {*} pI The planet-index of the planet to look up.
 * @param {*} jde The JDE at which to look up the position of the planet.
 * @returns {Number[]} [x, y, z] - position of the planet.
 */
function lookupPrecomputed (pI, jde) {
    const line1 = precomputedData[pI][Math.floor(jde)].split(' ')
    const line2 = precomputedData[pI][Math.ceil(jde)].split(' ')
    const frac = (jde % 1).toFixed(8) // .toFixed avoids non-exact numbers,
    // see comments of https://stackoverflow.com/a/4512317
    const x = Number(line1[0]) + frac * (line2[0] - line1[0])
    const y = Number(line1[1]) + frac * (line2[1] - line1[1])
    const z = Number(line1[2]) + frac * (line2[2] - line1[2])
    return [x, y, z]
}

/**
 * Finds the position of the passed planet at the passed JDE.
 * Uses VSOP87 to approximate the position.
 * @param {string} planetName
 * @param {number} jde
 * @returns {number[]} Array of length 3, containing xyz-coordinates
 */
function getPlanetPosition (planetName, jde) {
    const pI = planetIndex[planetName]
    if (PRECOMPUTED[pI] < jde + 1) {
        const sums = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0]
        ]
        let currentVar = 0
        let currentTerm = 0
        const T = (jde - 2451545) / 365250
        for (let i = 0; i < indata[pI].length; i++) {
            const line = indata[pI][i]
            if (line.length === 0) {
                continue
            }
            if (line.charAt(1).localeCompare('V') === 0) {
                const sublines = line.split(' ').filter(x => {
                    return x.length > 0
                })
                currentVar = Number(sublines[5].charAt(0)) - 1
                currentTerm = Number(sublines[7].charAt(4))
                continue
            }
            sums[currentVar][currentTerm] += computeTerm(line, T)
        }
        return [
            sums[0][0] + sums[0][1] * T + sums[0][2] * Math.pow(T, 2) +
            sums[0][3] * Math.pow(T, 3) + sums[0][4] * Math.pow(T, 4),
            sums[1][0] + sums[1][1] * T + sums[1][2] * Math.pow(T, 2) +
            sums[1][3] * Math.pow(T, 3) + sums[1][4] * Math.pow(T, 4),
            sums[2][0] + sums[2][1] * T + sums[2][2] * Math.pow(T, 2) +
            sums[2][3] * Math.pow(T, 3) + sums[2][4] * Math.pow(T, 4)
        ]
    } else {
        return lookupPrecomputed(pI, jde)
    }
}

export { getPlanetPosition }
