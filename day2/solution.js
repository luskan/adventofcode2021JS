const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');
function loadData(fileName) {
    return fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .trim()
        .split('\n')
        .map((v) => {
            const [name, val] = v.split(' ')
            return [name, parseInt(val)]
        });
}

function calculateMulOfDepthAndDistance(input) {
    const [depth, distance] = _.reduce(input,(memo, v) => {
        var [new_depth, new_distance] = memo;
        var [op_name, val] = v;
        switch (op_name) {
            case "forward": new_distance += val; break;
            case "down": new_depth += val; break;
            case "up": new_depth -= val; break;
        }
        return [new_depth, new_distance];
    }, [0, 0]);
    return depth * distance;
}

function calculateMulOfDepthAndDistancePart2(input) {
    const [depth, distance] = _.reduce(input,(memo, v) => {
        let [depth, distance, aim] = memo;
        let [op_name, val] = v;
        switch (op_name) {
            case "forward": distance += val; depth += aim * val; break;
            case "down": aim += val; break;
            case "up": aim -= val; break;
        }
        return [depth, distance, aim];
    }, [0, 0, 0]);
    return depth * distance;
}

function run() {
    const input = loadData('data.txt')

    console.log("\nDay 2")

    let val = calculateMulOfDepthAndDistance(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateMulOfDepthAndDistancePart2(input)
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateMulOfDepthAndDistance, calculateMulOfDepthAndDistancePart2}