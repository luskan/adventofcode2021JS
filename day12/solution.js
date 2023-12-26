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
    nodes = {}
    data
        .split('\n')
        .forEach((line) => {
            let m = line.match(/(\w+)-(\w+)/)
            let node1 = m[1]
            let node2 = m[2]

            if (node1 in nodes)
                nodes[node1].nodes.push(node2)
            else
                nodes[node1] = { nodes: [node2] }

            if (node2 in nodes)
                nodes[node2].nodes.push(node1)
            else
                nodes[node2] = { nodes: [node1] }
        })

    return nodes
}

function calculateNumberOfPaths(nodes, part2) {
    let stack = []
    let paths = []
    stack.push({
        path: ["start"],
        allowTwoSmallNodes: true
    })

    while(stack.length !== 0) {
        let nod = stack.pop()
        let current_node_name = nod.path.at(-1)
        let current_node = nodes[current_node_name]
        _.each(current_node.nodes, (n) => {
            let nextNodeallowTwoSmallNodes = nod.allowTwoSmallNodes
            if (!part2) {
                if (n.toLowerCase() === n && nod.path.includes(n))
                    return
            }
            else {
                // Ignore start, we dont want to go back to start
                if (n === "start")
                    return

                // If node is lowercase then special handling is due.
                if (n.toLowerCase() === n && n !== "end") {

                    if (!nod.allowTwoSmallNodes) {
                        if (_.find(nod.path, (nm) => nm === n))
                            return
                    }
                    else {
                        let count = _.countBy(nod.path, (nm) => nm === n)
                        if (count.true >= 1)
                            nextNodeallowTwoSmallNodes = false
                    }
                }
            }

            let next_node = {
                path: [],
                allowTwoSmallNodes: false
            }
            next_node.path = [...nod.path, n]
            next_node.allowTwoSmallNodes = nextNodeallowTwoSmallNodes
            if (n === "end")
                paths.push(next_node.path)
            else
                stack.push(next_node)
        })
    }

    return paths.length
}

function run() {
    console.log("\nDay 12")

    let input = loadData('data.txt')
    let val = calculateNumberOfPaths(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateNumberOfPaths(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateNumberOfPaths}