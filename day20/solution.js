const path = require('path');
const fs = require("fs");
const _ = require("underscore");
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString().split('\n'))
}

let LIT_PIXEL = 1
let DARK_PIXEL = 0

function parseData(data) {
    let algorithm_line = _.map(data[0], (c) => c === '#' ? LIT_PIXEL : DARK_PIXEL)
    let img = new Image()

    let x_off = 1000
    let y_off = 1000

    for (let n = 2; n < data.length; ++n) {
        for (let i = 0; i < data[n].length; ++i) {
            const [x, y] = [i + x_off, n + y_off - 2]
            img.setPixel(x, y, (data[n][i] === '#') ? LIT_PIXEL : DARK_PIXEL, true)
        }
    }

    img.addBorder(5)

    return { 'algorithm': algorithm_line, 'image': img}
}

class Image {
    #img
    #minx =  Number.MAX_SAFE_INTEGER
    #miny =  Number.MAX_SAFE_INTEGER
    #maxx = -Number.MAX_SAFE_INTEGER
    #maxy = -Number.MAX_SAFE_INTEGER

    constructor() {
        this.#img = new Map
    }

    unpackPos(pos, unpacked) {
        //let x = Math.floor(pos / 1000000)
        //let y = Math.floor(pos - x*1000000)

        // Maybe slightly faster version
        //https://stackoverflow.com/questions/34077449/fastest-way-to-cast-a-float-to-an-int-in-javascript
        unpacked[0] = ~~(pos / 100000)
        unpacked[1] = ~~(pos - unpacked[0]*100000)
    }

    packPos(x, y) {
        return x*100000 + y
    }

    setPixel(x, y, value, updateMinMax= false) {
        let key = this.packPos(x, y)
        this.#img.set(key, value)
        if (updateMinMax)
            this.#updateMinMax(x,y)
    }

    #updateMinMax(x, y) {
        this.#minx = Math.min(this.#minx, x)
        this.#miny = Math.min(this.#miny, y)
        this.#maxx = Math.max(this.#maxx, x)
        this.#maxy = Math.max(this.#maxy, y)
    }

    print() {
        console.log("")
        for (let y = this.#miny; y <= this.#maxy; ++y) {
            let line = ""
            for (let x = this.#minx; x <= this.#maxx; ++x) {
                let key = this.packPos(x, y)
                let c = '?'
                if (this.#img.has(key))
                    c = this.#img.get(key) === LIT_PIXEL ? '#' : '.'
                line += c
            }
            console.log(line)
        }
    }

    clearBorder(thickness) {
        let min_x = this.#minx + thickness
        let min_y = this.#miny + thickness
        let max_x = this.#maxx - thickness
        let max_y = this.#maxy - thickness
        for (let x = min_x - thickness; x <= max_x + thickness; x++) {
            for (let y = min_y - thickness; y <= max_y + thickness; y++) {
                if ( !((x >= min_x && x <= max_x) && (y >= min_y && y <= max_y)) )
                    this.setPixel(x, y, DARK_PIXEL, false)
            }
        }
    }

    addBorder(thickness) {
        let min_x = this.#minx
        let min_y = this.#miny
        let max_x = this.#maxx
        let max_y = this.#maxy
        for (let x = min_x - thickness; x <= max_x + thickness; x++) {
            for (let y = min_y - thickness; y <= max_y+ thickness; y++) {
                if ( (x >= min_x && x <= max_x) && (y >= min_y && y <= max_y) ) {
                }
                else {
                    this.setPixel(x, y, DARK_PIXEL, true)
                }
            }
        }
    }

    setMissingNeighbouringPixels(x, y, value) {
        _.each(this.#offsetArr, (off) => {
            let x_off = x + off[0]
            let y_off = y + off[1]
            let key = this.packPos(x_off, y_off)
            if (!this.#img.has(key)) {
                this.setPixel(x_off, y_off, value, true)
            }
        })
    }

    #offsetArr = [
        [-1,-1],
        [ 0,-1],
        [ 1,-1],

        [-1,0],
        [ 0,0],
        [ 1,0],

        [-1,1],
        [ 0,1],
        [ 1,1]]

    #pows = [
        Math.pow(2, 0),
        Math.pow(2, 1),
        Math.pow(2, 2),
        Math.pow(2, 3),
        Math.pow(2, 4),
        Math.pow(2, 5),
        Math.pow(2, 6),
        Math.pow(2, 7),
        Math.pow(2, 8)
    ]

    getPixelNeighbourhoodNumber(x, y) {
        let number = 0
        for (let n = this.#offsetArr.length-1; n >=0; n--) {
            let off = this.#offsetArr[n]
            let x_off = x + off[0]
            let y_off = y + off[1]
            let key = this.packPos(x_off, y_off)
            if (this.#img.has(key)) {
                let value = this.#img.get(key)
                if (value !== DARK_PIXEL)
                    number += this.#pows[this.#offsetArr.length - n - 1];
            }
        }
        return number
    }

    iterate(callbackFn) {
        this.#img.forEach(callbackFn)
    }
}

function calculateNumberOfLitPixels(data, iterations) {

    let currentImage = data.image
    let nextImage = new Image()
    let posArr = [0, 0]
    for (let iter = 0; iter < iterations; ++iter) {
        currentImage.iterate((value, key) => {
            currentImage.unpackPos(key, posArr)
            let algNumber = currentImage.getPixelNeighbourhoodNumber(posArr[0], posArr[1])
            let pixelValue =  data.algorithm[algNumber]
            nextImage.setPixel(posArr[0], posArr[1], pixelValue)
            nextImage.setMissingNeighbouringPixels(posArr[0], posArr[1], DARK_PIXEL)
        })

        if ((iter % 2) !== 0)
            nextImage.clearBorder(4)
        let tmp = currentImage
        currentImage = nextImage
        nextImage = tmp
    }

    let litCount = 0

    currentImage.clearBorder(5)

    // We must cut out the border.
    currentImage.iterate((value) => {
        litCount += (value === LIT_PIXEL) ? 1 : 0
    })
    return litCount
}

function run() {
    console.log("\nDay 20")

    let input = loadData('data.txt')
    let res = calculateNumberOfLitPixels(input, 2);
    console.log(`Part 1: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "1"))

     input = loadData('data.txt')
     res = calculateNumberOfLitPixels(input, 50);
    console.log(`Part 2: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateNumberOfLitPixels}