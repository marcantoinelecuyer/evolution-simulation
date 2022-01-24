import {config} from "./config.js";
import Organism from "../Organism.js";
import {generate_gene_color, randomGene, sense} from "./gene.js";
import Interface from "../Interface.js";

let danger_zone //= [100, 0, 800, 700]
let safe_zone = [200, 200, 600, 600]

export default class Environment {
    constructor(canvas) {
        this.canvas = canvas
        this.generation = 0
        this.age = 0
        this.autoPlay = false
    }

    init(animate) {
        this.animate = animate
        this.reproduce()
        this.start()
    }

    start() {
        Interface.setGeneration(this.generation)
        this.animate(this.draw)
    }

    draw = async () => {
        if (this.age >= config.LIFESPAN) {
            this.kill()
            return this.reproduce()
        }
        const promises = []
        this.organisms.forEach(org => promises.push(org.live(this)))
        await Promise.all(promises)

        const ctx = this.canvas.getContext('2d')
        ctx.globalCompositeOperation = 'destination-over';
        ctx.clearRect(0, 0, config.SIZE * 5, config.SIZE * 5)
        // Mark danger-zone
        if (danger_zone) {
            ctx.fillStyle = 'rgb(255,0,0,.1)'
            ctx.fillRect(danger_zone[0], danger_zone[1], danger_zone[2] - danger_zone[0], danger_zone[3] - danger_zone[1])
        } else if (safe_zone) {
            ctx.fillStyle = 'rgb(0,255,0,.1)'
            ctx.fillRect(safe_zone[0], safe_zone[1], safe_zone[2] - safe_zone[0], safe_zone[3] - safe_zone[1])
        }
        ctx.save()

        this.organisms.forEach(org => {
            if (!org.color) {
                org.color = generate_gene_color(org.gene)
            }
            ctx.fillStyle = org.color
            ctx.fillRect(org.x * 5, org.y * 5, 5, 5)
        })

        this.age++
        this.animate(this.draw)
    }

    reproduce = () => {
        this.generation++
        this.age = 0
        const newOrganisms = new Set()
        if (this.organisms) {
            while (newOrganisms.size < config.POPULATION) {
                for (const org of this.organisms) {
                    if (newOrganisms.size === config.POPULATION)
                        break
                    newOrganisms.add(new Organism(
                        Math.floor(Math.random() * config.SIZE),
                        Math.floor(Math.random() * config.SIZE),
                        org.gene
                    ))
                }
            }
        } else
            for (let i = 0; i < config.POPULATION; i++) {
                newOrganisms.add(new Organism(
                    Math.floor(Math.random() * config.SIZE),
                    Math.floor(Math.random() * config.SIZE),
                    randomGene()
                ))
            }
        this.organisms = newOrganisms

        if (this.autoPlay)
            this.start()
    }

    kill = () => {
        let numDeaths = 0
        const survivors = new Set()
        this.organisms.forEach(org => {
            if (danger_zone) {
                if (!(org.x * 5 >= danger_zone[0] && org.x * 5 <= danger_zone[2]
                    && org.y * 5 >= danger_zone[1] && org.y * 5 <= danger_zone[3])) {
                    survivors.add(org)
                } else
                    numDeaths++
            } else if (safe_zone)
                if (org.x * 5 > safe_zone[0] && org.x * 5 < safe_zone[2]
                    && org.y * 5 > safe_zone[1] && org.y * 5 < safe_zone[3]) {
                    survivors.add(org)
                } else
                    numDeaths++
        })
        this.organisms = survivors
        Interface.setDeaths(numDeaths)
    }

    toggleAutoPlay = () => {
        this.autoPlay = !this.autoPlay
    }
}