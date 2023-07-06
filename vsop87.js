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
    MERCURY: 0,
    VENUS: 1,
    EARTH: 2,
    MARS: 3,
    JUPITER: 4,
    SATURN: 5,
    URANUS: 6,
    NEPTUNE: 7
}
const indata = [planetIndex.length]
for (let i = 0; i < infiles.length; i++) {
    indata[i] = await readfile(infiles[i])
}

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

function extractCoefficients (line) {
    return line.split(' ').filter(x => {
        return x.length > 0
    }).slice(-3).map(x => {
        return Number(x)
    })
}

function computeTerm (line, T) {
    const c = extractCoefficients(line)
    return c[0] * Math.cos(c[1] + c[2] * T)
}
function getPlanetPosition (planetName, jde) {
    const pI = planetIndex[planetName]
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
}

export { getPlanetPosition }
