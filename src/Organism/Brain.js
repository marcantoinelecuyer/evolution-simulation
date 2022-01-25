import {decryptGene, execute, sense} from "./gene.js"
import {config} from "../config.js"

export default class Brain {
    constructor(genes) {
        const {sensors, actions, neutrals, weights} = decryptGene(genes)
        this.sensors = sensors
        this.actions = actions
        this.neutrals = neutrals
        this.weights = weights
        this.currNeutrals = new Set()
    }

    nextState = (env, organism) => {
        const infos = {
            env,
            x: organism.x, y: organism.y,
            dir: organism.dir,
            lastX: organism.lastX, lastY: organism.lastY,
        }
        const weights = this.weights.slice()

        // SENSE
        this.sensors.forEach((sensor, i) => {
            weights[this.neutrals + i] = weights[this.neutrals + i]
                .map(w => w * sense[sensor](infos))
        })
        for (let n = 0; n < this.neutrals; n++) {
            if (!this.currNeutrals.has(n))
                weights[n] = weights[n].fill(0)
        }
        this.currNeutrals = new Set()

        // CHANGE STATES
        const actions = new Set()
        weights.forEach(choices => {
            const rd = Math.random()
            choices.forEach((w, i) => {
                if (w >= rd)
                    if (i < this.neutrals)
                        this.currNeutrals.add(i)
                    else
                        actions.add(this.actions[i - this.neutrals])
            })
        })

        // ACT
        actions.forEach(action => {
            const {x, y, dir} = execute[action](organism.dir)
            organism.x += x
            if (organism.x < 0 || organism.x >= config.SIZE)
                organism.x -= x
            organism.lastX = x

            organism.y += y
            if (organism.y < 0 || organism.y >= config.SIZE)
                organism.y -= y
            organism.lastY = y

            organism.dir = organism.dir + dir
            if (organism.dir > 4)
                organism.dir = 1
        })
    }

}