const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .trim()
        .split(',')
        .reduce((accum, age) => {
            accum[parseInt(age)]++; return accum; }, [0,0,0,0,0,0,0,0,0,0])
}

function calculateNumberOfLanternfishes(input, days) {
    let fishes = input.map((x) => x)
    for (let day = 0; day < days; ++day) {
        fishes = _.reduce(fishes, (newFishesCounts, fishCount, index) => {
            if (index === 0) {
                newFishesCounts[6] = fishCount;
                newFishesCounts[8] = fishCount;
            }
            else {
                newFishesCounts[index-1] += fishCount
            }
            return newFishesCounts;
        }, [0,0,0,0,0,0,0,0,0,0])
    }
    return fishes.reduce((prev,cur) => prev + cur, 0)
}

function run() {
    input = loadData('data.txt')

    console.log("\nDay 6")

    let val = calculateNumberOfLanternfishes(input, 80);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateNumberOfLanternfishes(input, 256);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateNumberOfLanternfishes}