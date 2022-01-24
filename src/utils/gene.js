import {config} from "./config.js";

/**
 // gene[0] = source-type: sensory vs internal
 // gene[2:7] = source-id: which one
 // gene[8] = sink-type: internal vs action
 // gene[9:15] = sink-id: which one
 // gene[16:32] = weight
 **/

export const decryptGene = (genesCode) => {
    let neutrals = new Set()

    let sensors = new Set()
    let actions = new Set()
    genesCode = Array.from(hex2bin(genesCode).match(/.{32}/g))
        .map(binary => [
            binary[0],
            binary.substr(1, 8),
            binary[8],
            binary.substr(9, 8),
            binary.substr(16)
        ].map(n => parseInt(n, 2)))

    const links = new Set()

    genesCode.map(geneCode => {
        const link = {weight: sensorVal(geneCode[4], 65535)}
        if (geneCode[0]) {
            link.fromN = Math.floor(geneCode[1] / 255 * config.NEURONS)
            neutrals.add(link.fromN)
        } else {
            link.sensor = Object.values(sensor)[Math.floor(geneCode[1] / 255 * (sensorsLength - 1))]
            sensors.add(link.sensor)
        }
        if (geneCode[2]) {
            link.toN = Math.floor(geneCode[3] / 255 * config.NEURONS)
            neutrals.add(link.toN)
        } else {
            link.action = Object.values(action)[Math.floor(geneCode[3] / 255 * (actionsLength - 1))]
            actions.add(link.action)
        }
        links.add(link)
    })

    sensors = Array.from(sensors)
    actions = Array.from(actions)
    neutrals = Array.from(neutrals)
    let weights = Array(neutrals.length + sensors.length).fill([])
    weights = weights.map(c => Array(neutrals.length + actions.length).fill(0))
    links.forEach(link => {
        let i = link.sensor !== undefined ? (sensors.indexOf(link.sensor) + neutrals.length) : neutrals.indexOf(link.fromN)
        let j = link.action !== undefined ? (actions.indexOf(link.action) + neutrals.length) : neutrals.indexOf(link.toN)
        weights[i][j] = link.weight
    })
    return {weights, sensors, actions, neutrals: neutrals.length}
}

const hex2bin = (hex) => {
    return hex.split('').reduce((total, h) => {
        const bin = parseInt(h, 16).toString(2)
        return total + '0'.repeat(4 - bin.length) + bin
    }, '')
}

const hex_choices = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
export const mutate = (hex) => {
    const mutatingIdx = Math.floor(Math.random() * 16 * config.GENOME)
    return hex.substr(0, mutatingIdx)
        + hex_choices[Math.floor(Math.random() * 16)]
        + hex.substr(mutatingIdx + 1)
}

export const generate_gene_color = (hex) => {
    const len = Math.floor(hex.length / 3)
    const prod = 255 / parseInt('f'.repeat(len), 16)
    return 'rgba(' + parseInt(hex.substr(0, len), 16) * prod + ','
        + parseInt(hex.substr(len, len), 16) * prod + ','
        + parseInt(hex.substr(2 * len, len), 16) * prod + ',1)'
}

export const randomGene = () => {
    let gene = ''
    for (let i = 0; i < 16 * config.GENOME; i++) {
        gene += hex_choices[Math.floor(Math.random() * 16)]
    }
    return gene
}


// SENSOR-types
export const sensor = {
    Age: 1,  // Age
    // Gen: 2,  // Generation
    Lx: 3,   // Location on X-axis
    Ly: 4,   // Location on Y-axis
    LPf: 5,  // Population last movement direction
    BdX: 6,  // Closest boundary dist in X
    BdY: 7,  // Closest boundary dist in Y
    Ldx: 8,  // last moved direction in X
    Ldy: 9,  // last moved direction in Y
    // NiF: 10, // forward-distance of nearest individual
    // NbF: 11, // forward-distance of nearest boundary
    Pop: 12, // Population density in neighborhood
    // Ran: 13, //Random value
}
const sensorsLength = Object.keys(sensor).length

// ACTION-types
export const action = {
    MF: 1,  // Move forward
    MRe: 2, // Move reverse
    MvL: 3, // Move left
    MvR: 4, // Move right
    TrL: 5,  // Turn left
    TrR: 6,  // Turn right
    // MRa: 7,  // Move random

}
const actionsLength = Object.keys(action).length

export const execute = {
    [action.MF]: (dir) => {                // Move forward
        if (dir % 2 === 0)
            return {x: (dir === 2 ? 1 : -1), y: 0, dir: 0}
        else
            return {x: 0, y: (dir === 1 ? 1 : -1), dir: 0}
    },

    [action.MRe]: (dir) => {                // Move backward
        if (dir % 2 === 0)
            return {x: (dir === 2 ? -1 : 1), y: 0, dir: 0}
        else
            return {x: 0, y: (dir === 1 ? -1 : 1), dir: 0}
    },

    [action.MvL]: (dir) => {                // Move left
        if (dir % 2 === 0)
            return {x: 0, y: (dir === 2 ? 1 : -1), dir: 0}
        else
            return {x: (dir === 1 ? -1 : 1), y: 0, dir: 0}
    },

    [action.MvR]: (dir) => {                // Move right
        if (dir % 2 === 0)
            return {x: 0, y: (dir === 2 ? -1 : 1), dir: 0}
        else
            return {x: (dir === 1 ? 1 : -1), y: 0, dir: 0}
    },

    [action.TrL]: (dir) => {                // Turn left
        return {x: 0, y: 0, dir: -1}
    },

    [action.TrR]: (dir) => {                // Turn right
        return {x: 0, y: 0, dir: 1}
    },

    [action.MRa]: (dir) => {                // Move in random direction
        const rd = Math.random()
        let x = 0
        let y = 0
        if (rd < .5)
            x = rd < .25 ? 1 : -1
        else
            y = rd < .75 ? 1 : -1
        return {x, y, dir: 0}
    },
}

const sensorVal = (value, max) => {
    return (value - max / 2) * 2 / max
}

export const sense = {
    [sensor.Age]: ({env}) => {              // Age
        return sensorVal(env.age, config.LIFESPAN)
    },

    [sensor.Gen]: ({env}) => {              // Generation
        return 2 / (1 + Math.exp(-env.generation / 75)) - 1
    },

    [sensor.Lx]: ({x}) => {                 // Location on X-axis
        return sensorVal(x, config.SIZE)
    },

    [sensor.Ly]: ({y}) => {                 // Location on Y-axis
        return sensorVal(y, config.SIZE)
    },

    [sensor.LPf]: ({env}) => {              // Population last movement direction
        let dir = [0, 0]
        env.organisms.forEach(org => dir = [dir[0] + org.lastX, dir[1] + org.lastY])
        if (Math.abs(dir[0]) >= Math.abs(dir[1]))
            return sensorVal(dir[0] >= 0 ? 2 : 4, 4)
        else
            return sensorVal(dir[1] >= 0 ? 1 : 3, 4)
    },

    [sensor.BdX]: ({x}) => {                // Closest boundary dist in X
        return (x < (config.SIZE - x) ? -x : (config.SIZE - x)) / (config.SIZE / 2)
    },

    [sensor.BdY]: ({y}) => {                // Closest boundary dist in Y
        return (y < (config.SIZE - y) ? -y : (config.SIZE - y)) / (config.SIZE / 2)
    },

    [sensor.Ldx]: ({lastX}) => {            // last moved direction in X
        return lastX
    },

    [sensor.Ldy]: ({lastY}) => {            // last moved direction in Y
        return lastY
    },

    [sensor.NiF]: ({env, x, y, dir}) => {   // forward-distance of nearest individual
        let dist
        if (dir % 2 === 0) {
            const orgInVision = Array.from(env.organisms)
                .filter(org => org.y === y)
                .map(org => org.x)
            if (dir === 2)
                dist = Math.min(...orgInVision
                    .filter(orgX => orgX > x)) - x
            else
                dist = x - Math.max(...orgInVision
                    .filter(orgX => orgX < x))
        } else {
            const orgInVision = Array.from(env.organisms)
                .filter(org => org.x === x)
                .map(org => org.y)
            if (dir === 1)
                dist = Math.min(...orgInVision
                    .filter(orgY => orgY > y)) - y
            else
                dist = y - Math.max(...orgInVision
                    .filter(orgY => orgY < y))
        }
        return sensorVal(config.SIZE - dist, config.SIZE)
    },

    [sensor.NbF]: ({x, y, dir}) => {        // forward-distance of nearest boundary
        if (dir % 2 === 0)
            return sensorVal(dir === 2 ? config.SIZE - x : x, config.SIZE)
        else
            return sensorVal(dir === 1 ? config.SIZE - y : y, config.SIZE)
    },

    [sensor.Pop]: ({env, x, y}) => {        // Population density in neighborhood
        let distanceMean = 0
        env.organisms.forEach(org =>
            distanceMean += (config.SIZE - Math.sqrt((org.x - x) ** 2 + (org.y - y) ** 2)) / config.SIZE
        )
        distanceMean /= env.organisms.size
        return sensorVal(distanceMean, 1)
    },

    [sensor.Ran]: ({}) => {                 // Generate a random number
        return sensorVal(Math.random(), 1)
    },
}