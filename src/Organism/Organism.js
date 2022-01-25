import {config} from "../config.js";
import Brain from "./Brain.js"
import {mutate} from "./gene.js";

export default class Organism {
    constructor(x, y, parentGenes) {
        this.dir = 1
        this.x = x
        this.y = y

        if (Math.random() < config.MUTATION_RATE)   // MUTATE
            this.gene = mutate(parentGenes + '')
        else
            this.gene = parentGenes
        this.brain = new Brain(this.gene)
    }

    async live(env) {
        this.brain.nextState(env, this)
    }
}