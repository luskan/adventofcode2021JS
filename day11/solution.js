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
            mapInput[y].push({x_pos: x, y_pos: y, value: intInput[y][x], tag: 0, flash_count: 0})
        }
    }

    return mapInput
}

function calculateNumberOfFlashesOrSyncStep(input, returnSyncStep) {
    let n = 0
    while (true) {
        n++
        if (!returnSyncStep) {
            if (n === 101)
                break
        }
        let currentTag = n + 1

        // inc by 1
        let m = (x, y) => input[y][x]
        for (let y = 0; y < input.length; ++y) {
            for (let x = 0; x < input[y].length; ++x) {
                m(x,y).value++
            }
        }

        // flash
        let m_inc = (x, y) => {
            if (x >= 0 && x < input[0].length && y >= 0 && y < input.length) {
                input[y][x].value++
                if (input[y][x].value > 9 && input[y][x].tag !== currentTag)
                    return true
            }
            return false
        }
        let hasFlashed = false
        do {
            hasFlashed = false
            for (let y = 0; y < input.length; ++y) {
                for (let x = 0; x < input[y].length; ++x) {
                    if (m(x, y).value > 9 && m(x, y).tag !== currentTag) {
                        m(x, y).tag = currentTag
                        m(x, y).flash_count++

                        hasFlashed |= m_inc(x - 1, y - 1)
                        hasFlashed |= m_inc(x, y - 1)
                        hasFlashed |= m_inc(x + 1, y - 1)

                        hasFlashed |= m_inc(x - 1, y)
                        hasFlashed |= m_inc(x + 1, y)

                        hasFlashed |= m_inc(x - 1, y + 1)
                        hasFlashed |= m_inc(x, y + 1)
                        hasFlashed |= m_inc(x + 1, y + 1)
                    }
                }
            }
        } while(hasFlashed)

        // Zero energy for octopuses which flashed

        for (let y = 0; y < input.length; ++y) {
            for (let x = 0; x < input[y].length; ++x) {
                if (m(x, y).tag === currentTag) {
                    m(x, y).value = 0
                }
            }
        }

        if (returnSyncStep) {
            let valueSum = 0;
            for (let y = 0; y < input.length; ++y) {
                for (let x = 0; x < input[y].length; ++x) {
                     valueSum += m(x, y).value
                }
            }
            if (valueSum === 0)
                break;
        }
    }
    if (!returnSyncStep) {
        return _.reduce(input, (acc, line) => {
            return acc + _.reduce(line, (acc2, c) => {
                return acc2 + c.flash_count
            }, 0)
        }, 0)
    }
    else {
        return n
    }
}

function run() {
    console.log("\nDay 11")

    let input = loadData('data.txt')
    let val = calculateNumberOfFlashesOrSyncStep(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    input = loadData('data.txt')
    val = calculateNumberOfFlashesOrSyncStep(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateNumberOfFlashesOrSyncStep}