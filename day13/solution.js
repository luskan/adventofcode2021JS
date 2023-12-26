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
    let isParsingDots = true
    let dots = []
    let folds = []
    data.split('\n')
        .forEach((line) => {
            if (line.length === 0) {
                isParsingDots = false
                return
            }
            if (isParsingDots) {
                let m = line.match(/(\d+),(\d+)/)
                let pos = {
                    x: parseInt(m[1],10),
                    y: parseInt(m[2],10)
                }
                dots.push(pos)
            }
            else {
                let m = line.match(/fold along ([xy])=(\d+)/)
                folds.push({
                    along: m[1],
                    pos: parseInt(m[2], 10)
                })
            }

        })

    return {dots_data: dots, folds_data: folds}
}

function calculateNumberOfDots(data, part2) {
    let dots = data.dots_data
    let folds = (part2 === false) ? data.folds_data.slice(0, 1) : data.folds_data

    _.each(folds, (fold) => {
        let toFold = _.filter(dots,(dot) => {
            if (fold.along === "x") {
                if (dot.x > fold.pos)
                    return true
            }
            else if (fold.along === "y") {
                if (dot.y > fold.pos)
                    return true
            }
            return false
        })
        _.each(toFold, (dot) => {
            if (fold.along === "x") {
                dot.x = fold.pos - (dot.x - fold.pos)
            }
            else if (fold.along === "y") {
                dot.y = fold.pos - (dot.y - fold.pos)
            }
        })

        dots = dots.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.x === value.x && t.y === value.y
                ))
        )
    })

    if (part2) {
        let max_x = _.max(dots, (dot) => dot.x).x
        let max_y = _.max(dots, (dot) => dot.y).y
        for (let y = 0; y <= max_y; ++y) {
            let line = ""
            for (let x = 0; x <= max_x; ++x) {
                // Inefficient: dots should be an unordered dictionary (even object). But data is small...
                if (_.find(dots, (dot) => dot.x === x && dot.y === y))
                    line += '#'
                else
                    line += '.'
            }
            console.log(line)
        }
    }

    return dots.length
}

function run() {
    console.log("\nDay 13")

    let input = loadData('data.txt')
    let val = calculateNumberOfDots(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateNumberOfDots(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2")) // PFKLKCFP
}

module.exports = { run, loadData, parseData, calculateNumberOfDots}

