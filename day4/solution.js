const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .trim()
        .split('\n\n')
        .map( (line) => {
            return line.split('\n')
                .map((line) => line.trim().split(/[\s,]+/).map(c => parseInt(c)))
        })
        ;
}

function sumNonWinningCells(board) {
    let sum = 0
    for (let i = 0; i < board.length; ++i) {
        for (let j = 0; j < board[i].length; ++j) {
            if (board[i][j] >= 0)
                sum += board[i][j];
        }
    }
    return sum
}

function isWinningBoard(board) {
    // Find winning row
    for (let i = 0; i < board.length; ++i) {
        let isWining = true
        for (let j = 0; j < board[i].length; ++j) {
            if (board[i][j] >= 0 && !Object.is(board[i][j], -0))
                isWining = false
        }
        if (isWining)
            return true
    }

    //
    // Find winning column

    // iterate each column with i
    for (let i = 0; i < board[0].length; ++i) {
        let isWining = true
        // iterate each row with j
        for (let j = 0; j < board.length; ++j) {
            // Check the same column i for each row j
            if (board[j][i] >= 0 && !Object.is(board[j][i], -0))
                isWining = false
        }
        if (isWining)
            return true
    }
}

function calculateWiningBoard(input, part2) {
    let result = 0
    let winningCard = {}
    _.every(input[0][0], (number) => {
        _.every(input, (board, index) => {
            if (index > 0) {
                _.every(board, (row) => {
                    _.every(row, (num, ind, lst) => {
                        if (number === num)
                            lst[ind] = -num;
                        return true
                    })
                    return true
                })
            }
            return true
        })

        return _.every(input, (board, index) => {
            if (index > 0) {
                if (isWinningBoard(board) && !(index in winningCard)) {
                    winningCard[index] = 1
                    result = sumNonWinningCells(board) * number
                    return !!part2
                }
            }
            return true
        })
    })
    return result
}

function run() {
    const input = loadData('data.txt')

    console.log("\nDay 4")

    let val = calculateWiningBoard(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateWiningBoard(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateWiningBoard}