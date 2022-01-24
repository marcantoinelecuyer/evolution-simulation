import {config} from "./utils/config.js";

export default class Interface {
    static setGeneration(newGen) {
        document.querySelector('.generation-num').innerHTML = newGen
    }

    static setDeaths(deaths) {
        document.querySelector('.deaths span').innerHTML = deaths
    }
}


document.querySelector('.range-slider').addEventListener('input', (e) => {
    document.querySelector('.input-slider').setAttribute('value', e.target.value)
    config.MUTATION_RATE = e.target.value
})

document.querySelector('.input-slider').addEventListener('input', (e) => {
    // document.querySelector('.range-slider').setAttribute('value', e.target.value)
    config.MUTATION_RATE = e.target.value
})