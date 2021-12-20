const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");

function loadData(fileName) {
    return fs
        .readFileSync(path.join(__dirname, fileName), "utf-8")
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
    assert(val === 361169)

    val = calculateNumberOfLanternfishes(input, 256);
    console.log(`Part 2: ${val}`)
    assert(val === 1634946868992)
}

module.exports = { run, loadData, calculateNumberOfLanternfishes}