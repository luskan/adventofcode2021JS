const path = require('path');
const fs = require("fs");
const assert = require("assert");
const common = require('../common');require("google-closure-library");
goog.require("goog.structs");
goog.require("goog.structs.PriorityQueue");

function loadData(fileName, part2) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString(), part2)
}

function parseData(data, part2) {
    let intInput = data
        .split('\n')
        .map((line) => line.split('').map((v) => parseInt(v, 10) ))

    let height = intInput.length
    let width = intInput[0].length

    let mapInput = []
    for (let y = 0; y < height * (part2 ? 5 : 1); ++y) {
        mapInput.push([])
        for (let x = 0; x < width * (part2 ? 5 : 1); ++x) {

            let addValue = Math.floor(x/width) + Math.floor(y/height)

            let value = intInput[y % height][x % width] + (part2 ? addValue : 0)
            if (value >= 10)
                value -= 9

            mapInput[y].push({
                cost:  value ,
                costFromStart: Number.MAX_SAFE_INTEGER,
                prevNode: {x:0,y:0}})
        }
    }

    return mapInput
}

function calculateLowerRiskPathCost(nodes) {
    let unvisited = new goog.structs.PriorityQueue()

    unvisited.enqueue(0, {
        x:0,
        y:0
    })
    nodes[0][0].costFromStart = 0

    let tryAddNextPathNode = (x_off, y_off, prevNodeXY) => {

        // Check if visiting this node is allowed
        let x = prevNodeXY.x + x_off
        let y = prevNodeXY.y + y_off
        if (x < 0 || x >= nodes[0].length) {
            return
        }
        if (y < 0 || y >= nodes.length) {
            return
        }

        let node = nodes[y][x]

        // Check if it was already visited
        if (node.costFromStart !== Number.MAX_SAFE_INTEGER)
            return

        let prevNode = nodes[prevNodeXY.y][prevNodeXY.x]

        // Check if distance to this node is of lower cost than before
        let newCost = node.cost + prevNode.costFromStart
        if (newCost < node.costFromStart) {
            node.costFromStart = newCost
            node.prevNode = prevNodeXY
        }

        // Add new candidate
        unvisited.enqueue( node.costFromStart,{
            "x": x,
            "y": y})
    }

    while(!unvisited.isEmpty()) {
        let nod = unvisited.dequeue()
        tryAddNextPathNode(0, -1, nod)
        tryAddNextPathNode(-1, 0, nod)
        tryAddNextPathNode(1, 0, nod)
        tryAddNextPathNode(0, 1, nod)
    }

    return nodes[nodes.length-1][nodes[0].length-1].costFromStart
}

/***
 * Solution uses Dijkstra’s Shortest Path Algorithm
 * There is a very good explanation here: https://www.youtube.com/watch?v=pVfj6mxhdMw
 */

function run() {
    console.log("\nDay 15")

    let input = loadData('data.txt', false)
    let val = calculateLowerRiskPathCost(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    input = loadData('data.txt', true)
    val = calculateLowerRiskPathCost(input);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateLowerRiskPathCost}