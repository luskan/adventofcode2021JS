const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const assert = require('assert')
const common = require('../common');


function loadData(fileName) {
    return fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .trim()
        .split('\n')
        .map((v) => {
            return parseInt(v, 10);
        });
}

function calculateNumberOfIncreases(input) {
    return _.map(input, (cur, i, arr) =>
        i ? ((cur - arr[i - 1] > 0) ? 1 : 0) : 0)
        .reduce((previousValue, currentValue) => previousValue + (currentValue === 1 ? 1 : 0))
}

function calculateNumberOfSlidingWindowIncreases(input) {
    return _.map(input, (cur, i, arr) => {
        if (i + 2 >= arr.lemgth)
            return -1
        return cur + arr[i+1] + arr[i+2]})
        .slice(0, input.length - 2)
        .map((cur, i, arr) =>
            i ? ((cur - arr[i - 1] > 0) ? 1 : 0) : 0)
        .reduce((previousValue, currentValue) => previousValue + (currentValue === 1 ? 1 : 0))
}

function run() {
    const input = loadData('data.txt')

    console.log("Day 1")

    let val = calculateNumberOfIncreases(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateNumberOfSlidingWindowIncreases(input)
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, calculateNumberOfIncreases, loadData, calculateNumberOfSlidingWindowIncreases };