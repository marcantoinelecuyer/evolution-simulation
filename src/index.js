import {config} from "./utils/config.js";
import Environment from "./utils/Environment.js"

const canvas = document.querySelector('canvas')
canvas.width = config.SIZE * 5
canvas.height = config.SIZE * 5

let ENV

const init = () => {
    ENV = new Environment(canvas)
    ENV.init(animate)
}

let pause = false
const animate = (draw) => {
    if (!pause)
        requestAnimationFrame(draw)
}

document.querySelector('.pauseBtn').addEventListener('click', () => {
    pause = !pause
    if (pause === false)
        requestAnimationFrame(ENV.draw)
})

document.querySelector('.startBtn').addEventListener('click',
    () => {
        init()
    })

document.querySelector('.nextGenBtn').addEventListener('click',
    () => {
        ENV.start()
    })

document.querySelector('.autoplayBtn').addEventListener('click',
    () => {
        ENV.toggleAutoPlay()
        const state = document.querySelector('.autoplayBtn span')
        state.innerHTML = state.innerHTML === 'OFF' ? 'ON' : 'OFF'
    })


