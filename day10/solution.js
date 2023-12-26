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
    return data
        .split('\n')
}

function calculateSyntaxErrorScore(input, part2) {
    let opening = ['(', '[', '{', '<']
    let closing = [')', ']', '}', '>']
    let points = {')': 3, ']': 57, '}': 1197, '>': 25137}
    let pointsPart2 = {')': 1, ']': 2, '}': 3, '>': 4}
    let openToClose = {'(': ')', '[': ']', '{': '}', '<': '>'}

    if (!part2) {
        return _.reduce(input, (acc, line) => {
            let stack = []
            for (let n = 0; n < line.length; ++n) {
                let c = line[n]
                if (opening.includes(c)) {
                    stack.push(c)
                } else if (closing.includes(c)) {
                    let last_c = stack.pop()
                    let shouldBeCloseParen = openToClose[last_c]
                    if (c !== shouldBeCloseParen) {
                        return acc + points[c]
                    }
                }
            }
            if (stack.length !== 0) {
                // Should be empty
            }
            return acc
        }, 0)
    }
    else {
        let completes = _.map(input, (line) => {
            let stack = []
            for (let n = 0; n < line.length; ++n) {
                let c = line[n]
                if (opening.includes(c)) {
                    stack.push(c)
                } else if (closing.includes(c)) {
                    let last_c = stack.pop()
                    let shouldBeCloseParen = openToClose[last_c]
                    if (c !== shouldBeCloseParen) {
                        // This line is corrupted, so abort with empty line
                        return ""
                    }
                }
            }
            if (stack.length === 0) {
                // Correct line
                return ""
            }

            // If here then this line is incomplete
            let completedStack = _.map(stack, (c) => openToClose[c]).reverse()

            return completedStack.join('')
        })

        completes = _.filter(completes, (c) => c.length !== 0)
        let scores = _.map(completes, (c) => {
            return  _.reduce(c, (acc, c2) => acc * 5 + pointsPart2[c2], 0)
        }).sort((a,b) => a-b)
        return scores[Math.floor(scores.length/2)]
    }
}

function run() {
    let input = loadData('data.txt')

    console.log("\nDay 10")

    let val = calculateSyntaxErrorScore(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateSyntaxErrorScore(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateSyntaxErrorScore}