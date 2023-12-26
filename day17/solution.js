const path = require('path');
const fs = require("fs");
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString())
}

function parseData(data) {
    //target area: x=192..251, y=-89..-59
    return /target area: x=(?<x0>[-\w]+)..(?<x1>[-\w]+), y=(?<y0>[-\w]+)..(?<y1>[-\w]+)/.exec(data).groups
}

//
// Finally I didnt use below 3 functions, as they didnt fit the discrete nature of the problem.
// I still think they could be of use in optimizing the brute force solution, especially for y component.
/*
function calculateRange(vx, vy, g, h) {
    //Range of the projectile: R = Vx * [Vy + √(Vy² + 2 * g * h)] / g
    let x_range = vx * (vy + Math.sqrt(vy*vy + 2 * g * h)) / g
    return x_range
}

function calculateVxForRange(vx, vy, g, h) {
    //Range of the projectile: R = Vx * [Vy + √(Vy² + 2 * g * h)] / g
    let x_range = vx * (vy + Math.sqrt(vy*vy + 2 * g * h)) / g
    return x_range
}

function calculateHMax(h, vy, g) {
    // hmax = h + Vy² / (2 * g)
    let hmax = h + (vy*vy) / (2 * g)
    return hmax
}
*/

function calculateHighestYTrajectory2(data, vx, vy) {
    let maxY = -Number.MAX_SAFE_INTEGER
    let x = 0, y = 0;
    while(true) {
        x += vx
        if (vx < 0)
            vx++
        else if ( vx > 0)
            vx--

        y += vy
        vy--

        if (y > maxY)
            maxY = y

        if (   x >= data.x0 && x <= data.x1
            && y >= data.y0 && y <= data.y1 )
        {
            return maxY
        }

        if ( x > data.x1 || y < data.y0 ) {
            return -Number.MAX_SAFE_INTEGER
        }
    }
}

function calculateHighestYTrajectory(data) {
    let maxY = -Number.MAX_SAFE_INTEGER
    let vel_count = 0
    let x_range = Math.abs(data.x1)
    let y_range = Math.abs(data.y0)
    for (let vx = -x_range; vx <= x_range; ++vx) {
        for (let vy = -y_range; vy <= y_range; ++vy) {
            let y = calculateHighestYTrajectory2(data, vx, vy)
            if (y > maxY) {
                maxY = y
            }
            if (y !== -Number.MAX_SAFE_INTEGER) {
                vel_count++
            }
        }
    }
    return {max_h: maxY, vel_count: vel_count}
}

function run() {
    console.log("\nDay 17")

    let input = loadData('data.txt')
    let val = calculateHighestYTrajectory(input).max_h;
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    input = loadData('data.txt', true)
    val = calculateHighestYTrajectory(input).vel_count;
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateHighestYTrajectory}