const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const assert = require('assert')

function loadData(file_name) {
    return fs
        .readFileSync(path.join(__dirname, './' + file_name), 'utf8')
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
        .reduce((previousValue, currentValue) => previousValue + (currentValue == 1 ? 1 : 0))
}

function calculateNumberOfSlidingWindowIncreases(input) {
    return _.map(input, (cur, i, arr) => {
        if (i + 2 >= arr.lemgth)
            return -1
        return cur + arr[i+1] + arr[i+2]})
        .slice(0, input.length - 2)
        .map((cur, i, arr) =>
            i ? ((cur - arr[i - 1] > 0) ? 1 : 0) : 0)
        .reduce((previousValue, currentValue) => previousValue + (currentValue == 1 ? 1 : 0))
}

function runDay1() {
    const input = loadData('data.txt')

    console.log("Day 1")

    let val = calculateNumberOfIncreases(input);
    console.log(`Part 1: ${val}`)
    assert(val == 1466)

    val = calculateNumberOfSlidingWindowIncreases(input)
    console.log(`Part 2: ${val}`)
    //assert(val == 1466)
}

module.exports = { runDay1, calculateNumberOfIncreases, loadData, calculateNumberOfSlidingWindowIncreases };