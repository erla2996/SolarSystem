'''
The js code to 'translate':

async function precompute (planetName, jdeMax, outfile = null) {
    if (outfile == null) {
        outfile = precomputedFiles[planetIndex[planetName]]
    }
    // outfile ??= precomputedFiles[planetIndex[planetName]]
    const file = fs.open(outfile, 'w')
    file.write('*** Precomputed data for planet ' + planetName + ', up to JDE : ' + (jdeMax + 1).toString() + ' ***\n')
    for (let jde = 0; jde < jdeMax; jde++) {
        const pos = getPlanetPosition(planetName, jde)
        file.write(pos[0].toString() + ' ' + pos[1].toString() + ' ' + pos[2].toString() + '\n')
    }
    file.close()
}
'''

import math
import subprocess

jdeMax = 1e5


precomputedFiles = [
    'vsop87Computed/VSOP87C.mer.precomp',
    'vsop87Computed/VSOP87C.ven.precomp',
    'vsop87Computed/VSOP87C.ear.precomp',
    'vsop87Computed/VSOP87C.mar.precomp',
    'vsop87Computed/VSOP87C.jup.precomp',
    'vsop87Computed/VSOP87C.sat.precomp',
    'vsop87Computed/VSOP87C.ura.precomp',
    'vsop87Computed/VSOP87C.nep.precomp'
]
infiles = [
    'vsop87/VSOP87C.mer',
    'vsop87/VSOP87C.ven',
    'vsop87/VSOP87C.ear',
    'vsop87/VSOP87C.mar',
    'vsop87/VSOP87C.jup',
    'vsop87/VSOP87C.sat',
    'vsop87/VSOP87C.ura',
    'vsop87/VSOP87C.nep'
]
planetNames = [
    'MERCURY',
    'VENUS',
    'EARTH',
    'MARS',
    'JUPITER',
    'SATURN',
    'URANUS',
    'NEPTUNE'
]

def readfile(fname):
    with open(fname, 'r') as file:
        return file.readlines()

indata = [None] * len(infiles)
for i in range(len(infiles)):
    indata[i] = readfile(infiles[i])

def extractCoefficients(line):
    return line.split()[-3:]

def computeTerm(line, T):
    c = extractCoefficients(line)
    return float(c[0]) * math.cos(float(c[1]) + float(c[2]) * T)

def getPlanetPosition(planetName, jde):
    pI = planetNames.index(planetName)
    sums = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
    ]
    currentVar = 0
    currentTerm = 0
    T = (jde - 2451545) / 365250.0
    for  i in range(len(indata[pI])):
        line = indata[pI][i]
        if len(line) == 0:
            continue
        if line[1] == 'V':
            sublines = line.split()
            currentVar = int(sublines[5][0]) - 1
            currentTerm = int(sublines[7][4])
            continue
        sums[currentVar][currentTerm] += computeTerm(line, T)

    return [
            sums[0][0] + sums[0][1] * T + sums[0][2] * pow(T, 2) +
            sums[0][3] * pow(T, 3) + sums[0][4] * pow(T, 4),
            sums[1][0] + sums[1][1] * T + sums[1][2] * pow(T, 2) +
            sums[1][3] * pow(T, 3) + sums[1][4] * pow(T, 4),
            sums[2][0] + sums[2][1] * T + sums[2][2] * pow(T, 2) +
            sums[2][3] * pow(T, 3) + sums[2][4] * pow(T, 4)
        ]

for i in range(len(infiles)):
    subprocess.run(['mkdir', '-p', 'vsop87Computed'])
    fname = precomputedFiles[i]
    infile = infiles[i]
    planetName = planetNames[i]
    with open(fname, 'w') as outfile:
        outfile.write('*** Precomputed data for planet ' + planetName + ', up to JDE : ' + str(int(jdeMax + 1)) + ' ***\n')
        for jde in range(int(jdeMax)):
            pos = getPlanetPosition(planetName, jde)
            outfile.write(str(pos[0]) + ' ' + str(pos[1]) + ' ' + str(pos[2]) + '\n')
