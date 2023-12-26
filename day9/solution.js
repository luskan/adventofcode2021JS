const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString())
}

function parseData(data) {
    let intInput = data
        .split('\n')
        .map((line) => line.split('').map((v) => parseInt(v, 10) ))

    let mapInput = []
    for (let y = 0; y < intInput.length; ++y) {
        mapInput.push([])
        for (let x = 0; x < intInput[y].length; ++x) {
            mapInput[y].push({x_pos: x, y_pos: y, value: intInput[y][x], tag: 0})
        }
    }

    return mapInput
}

function collectNearBys(input, x, y) {
    let nearbys = []
    if (x > 0)
        nearbys.push(input[y][x - 1])
    if (x < input[y].length - 1)
        nearbys.push(input[y][x + 1])
    if (y > 0)
        nearbys.push(input[y - 1][x])
    if (y < input.length - 1)
        nearbys.push(input[y + 1][x])
    return nearbys
}

// Part 1
function calculateRiskLevels(input) {
    let lowPoints = []
    for (let y = 0; y < input.length; ++y) {
        for (let x = 0; x < input[y].length; ++x) {
            let nearbys = collectNearBys(input, x, y)
            let cur = input[y][x]
            if(_.every(nearbys, (c) => c.value > cur.value ))
                lowPoints.push(cur)
        }
    }
    return lowPoints
}
function calculateSumOfRiskLevels(input) {
   return _.reduce(calculateRiskLevels(input), (acc, v) => acc + v.value + 1, 0)
}

// Part 2
function calculateBasinRecursively(input, point, basinPoints, tag) {
    let stack = []
    stack.push(point)

    while(stack.length !== 0) {
        point = stack.pop()

        // Some positions could have been inserted multiple times into stack, so check tag to
        // verify if it was already processed.
        if (point.tag === tag)
            continue

        point.tag = tag
        basinPoints.push(point.value)

        let x = point.x_pos
        let y = point.y_pos

        let m = (x, y) => input[y][x]

        if (x > 0 && m(x - 1, y).value !== 9 && m(x - 1, y).tag !== tag)
            stack.push(m(x - 1, y))

        if (x < input[y].length - 1 && m(x + 1, y).value !== 9 && m(x + 1, y).tag !== tag)
            stack.push(m(x + 1, y))

        if (y > 0 && m(x,y - 1).value !== 9 && m(x,y - 1).tag !== tag)
            stack.push(m(x,y - 1))

        if (y < input.length - 1 && m(x,y + 1).value !== 9 && m(x,y + 1).tag !== tag)
            stack.push(m(x,y + 1))
    }
}

function calculateMultiplyOfThreeLargestBasins(input) {
    let lowPoints = calculateRiskLevels(input)
    let currentTag = 0
    let basins = _.map(lowPoints, (point) => {
        let basinPoints = []
        currentTag++
        calculateBasinRecursively(input, point, basinPoints, currentTag)
        return basinPoints
    })
    basins = _.chain(basins)
        .sortBy((b) => b.length)
        .reverse()
        .first(3)
        .value()
    return _.reduce(basins, (acc, b) => acc*b.length, 1)
}

function run() {
    let input = loadData('data.txt')

    console.log("\nDay 9")

    let val = calculateSumOfRiskLevels(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateMultiplyOfThreeLargestBasins(input);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateSumOfRiskLevels, calculateMultiplyOfThreeLargestBasins}