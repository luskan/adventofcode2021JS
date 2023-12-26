const assert = require("assert");
const fs = require("fs");
const path = require("path");
const _ = require("lodash")
const common = require('../common');

function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .split('\n'))
}

function parseData(data) {
    let parsed_data = []
    data.forEach((line) => parsed_data.push(line.split('')))
    return parsed_data;
}

let try_move_right = (prev_map, map, r, c) => {
    if (prev_map[r][(c + 1)%prev_map[r].length] === '.') {
        map[r][(c + 1)%prev_map[r].length] = '>'
        map[r][c] = '.'
        return true
    }
    return false
}

let try_move_down = (prev_map, map, r, c) => {
    if (prev_map[(r + 1)%prev_map.length][c] === '.') {
        map[(r + 1)%prev_map.length][c] = 'v'
        map[r][c] = '.'
        return true
    }
    return false
}

function calculateStepNumber(input) {
    let prev_map = input
    let cur_map = _.cloneDeep(prev_map)

    let steps = 0
    while(true) {
        //console.log(`#${steps}`)
        //for (let r = 0; r < prev_map.length; ++r)
        //    console.log(prev_map[r].join(''))

        let move_counter = 0
        for (let type of [0, 1]) {
            for (let r = 0; r < prev_map.length; ++r) {
                for (let c = 0; c < prev_map[r].length; ++c) {
                    if (type === 0 && prev_map[r][c] === '>')
                        move_counter += try_move_right(prev_map, cur_map, r, c) ? 1 : 0
                    else if (type === 1 && prev_map[r][c] === 'v')
                        move_counter += try_move_down(prev_map, cur_map, r, c) ? 1 : 0
                }
            }

            for (let r = 0; r < prev_map.length; ++r) {
                for (let c = 0; c < prev_map[r].length; ++c)
                    prev_map[r][c] = cur_map[r][c]
            }
        }
        let tmp_map = prev_map
        prev_map = cur_map
        cur_map = tmp_map
        steps++

        if (move_counter === 0)
            break;
    }
    return steps
}

function run() {
    console.log("\nDay 25")

    let input = loadData('data.txt', true)

    let res = calculateStepNumber(input, true);
    console.log(`Part 1: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "1"))

}

module.exports = {run, loadData, parseData, calculateStepNumber}