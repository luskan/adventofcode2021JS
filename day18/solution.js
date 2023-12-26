const path = require('path');
const fs = require("fs");
const _ = require("underscore");
const assert = require("assert");
const common = require('../common');function parseData(data) {
    return _.filter(data.split('\n'), (d) => d.length !== 0)
}

function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString())
}

function isCharNumber(c) {
    return c >= '0' && c <= '9';
}

class Node {
    constructor(data) {
        this.data = data
        this.parent = null
        this.left = null
        this.right = null
    }
}

/**
 * Stores snailfish number in a tree based structure, does not use recursion for iterations.
 * Note: next interesting optimization would be a Node object pool, to avoid allocations.
 */
class NumberTree {
    #root

    constructor() {
        this.#root = null
    }

    /**
     * Parses string number to tree
     * @param number_str - ex.: [[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]
     */
    parseFromNumberString(number_str) {
        this.root = new Node(null)
        let currentNode = this.root

        for (let c of number_str) {
            if (c === '[') {
                let newNode = new Node(null)
                newNode.parent = currentNode
                currentNode.left = newNode
                currentNode = newNode
            } else if (c === ']') {
                currentNode = currentNode.parent
            } else if (isCharNumber(c)) {
                if (currentNode.data)
                    currentNode.data *= 10 // Parsing two digits only for split tests
                else
                    currentNode.data = 0
                currentNode.data += parseInt(c, 10)
            } else if (c === ',') {
                currentNode = currentNode.parent
                let newNode = new Node(null)
                newNode.parent = currentNode
                currentNode.right = newNode
                currentNode = newNode
            } else {
                assert(false)
            }
        }
        return this
    }

    tryReduceBySplit() {
        let node_to_split = null
        this.#traverseTree((node) => {
                if (node.data >= 10) {
                    node_to_split = node
                    return true
                }
            });
        if (node_to_split) {
            let d1 = Math.floor(node_to_split.data/2)
            let d2 = Math.ceil(node_to_split.data/2)

            node_to_split.data = null

            node_to_split.left = new Node(d1)
            node_to_split.left.parent = node_to_split

            node_to_split.right = new Node(d2)
            node_to_split.right.parent = node_to_split
            return true
        }

        return false
    }

    tryReduceByExplode() {
        let data_nodes = []
        let depth = -1
        let was_exploded = false
        this.#traverseTree((node) => {
                data_nodes.push([depth, node])
                if (data_nodes.length >= 4) {
                    if (data_nodes.at(-3)[0] >= 4
                        && data_nodes.at(-2)[0] >= 4) {
                        return true
                    }
                }
            },
            () => depth++,
            null,
            () => depth--
        )

        for (let n = 0; n < data_nodes.length-1; ++n) {
            if (data_nodes[n][0] >= 4
                && data_nodes[n+1][0] >= 4
                && data_nodes[n][0] === data_nodes[n+1][0]
            ) {
                if (n > 0)
                    data_nodes[n-1][1].data += data_nodes[n][1].data
                if (n+2 <= data_nodes.length-1)
                    data_nodes[n+2][1].data += data_nodes[n+1][1].data

                let n1 = data_nodes[n][1]
                let n1parent = n1.parent
                n1parent.data = 0
                n1parent.left = null
                n1parent.right = null
                was_exploded = true
                return true
            }
        }
        return was_exploded
    }

    reduce() {
        let t1, t2
        do {
           t1 = this.tryReduceByExplode();
           if (t1) {
               // It fails without this continue to pass tests, but I am not sure if it was
               //  stated to do it.
               continue;
           }
           t2 = this.tryReduceBySplit();
        } while(t1 || t2)
    }

    /**
     * Converts tree back to string
     * @returns {string}
     */
    convertToNumberString() {
        let res = ""
        this.#traverseTree((node) => res += node.data,
            () => res += "[",
            () => res += ",",
            () => res += "]")
        return res
    }

    magnitude() {
        let stack = []
        this.#traverseTree((node) => stack.push(node.data),
            null,null,
            () => stack.push(2*stack.pop() + 3*stack.pop())
        )
        return stack[0]
    }

    /***
     * Traverses tree executing callback in-order styler_func
     * @param in_order_func callback called when data node is found - in order style. Return true from it to stop traversal
     * @param next_left_node callback called when entering left non-data node
     * @param in_between_nodes callback called when beeing in between two nodes
     * @param next_right_node callback called when leaving right node
     */
    #traverseTree(in_order_func, next_left_node, in_between_nodes, next_right_node) {
        let current_node = this.root
        let stack = []

        // Mode indicates how current_node was already processed
        const mode_entered_none = 0     // first time enter
        const mode_entered_left = 1     // it was on stack after processing left sub tree
        const mode_entered_right = 2    // it was on stack after processing left and also right trees
        let mode = mode_entered_none

        while (current_node) {

            if (mode === mode_entered_none) {
                if (current_node.left === null) {
                    if (mode === mode_entered_none) {
                        let res = in_order_func(current_node)
                        if (res !== undefined && res === true)
                            break
                    }
                    current_node = current_node.right
                    if (current_node == null)
                        [mode, current_node] = stack.pop()
                } else {
                    if (next_left_node)
                        next_left_node(current_node)
                    stack.push([mode_entered_left, current_node])
                    current_node = current_node.left
                }
            } else if (mode === mode_entered_left) {
                if (in_between_nodes && current_node.left && current_node.right)
                    in_between_nodes(current_node)

                if (current_node.right == null) {
                    [mode, current_node] = stack.pop()
                } else {
                    stack.push([mode_entered_right, current_node])
                    mode = mode_entered_none
                    current_node = current_node.right
                }
            } else if (mode === mode_entered_right) {
                if (next_right_node)
                    next_right_node(current_node)
                current_node = null
                if (stack.length !== 0)
                    [mode, current_node] = stack.pop()
            }
        }
    }

    sumOfTwoNumbers(number1, number2) {
        let num1PlusNum2 = `[${number1},${number2}]`
        this.parseFromNumberString(num1PlusNum2)
        this.reduce()
        return this
    }
}

function calculateSumOfNumbers(numbers) {
    let num1 = numbers[0]
    let number_tree = new NumberTree()
    for (let n = 1; n < numbers.length; ++n) {
        number_tree.sumOfTwoNumbers(num1, numbers[n])
        num1 = number_tree.convertToNumberString()
    }
    return num1
}

function calculateMagnitudeOfFinalSum(numbers) {
    return new NumberTree()
        .parseFromNumberString(calculateSumOfNumbers(numbers))
        .magnitude()
}

function calculateHighestMagnitudeTwoNumbersSum(numbers) {
    let highest_magnitude = 0
    let number_tree = new NumberTree()
    for (let n = 0; n < numbers.length; ++n) {
        for (let k = n + 1; k < numbers.length; ++k) {
            number_tree.sumOfTwoNumbers(numbers[n], numbers[k])
            let mag = number_tree.magnitude()
            if (mag > highest_magnitude)
                highest_magnitude = mag

            number_tree.sumOfTwoNumbers(numbers[k], numbers[n])
            mag = number_tree.magnitude()
            if (mag > highest_magnitude)
                highest_magnitude = mag
        }
    }
    return highest_magnitude
}

function run() {
    console.log("\nDay 18")

    let input = loadData('data.txt')
    let val = calculateMagnitudeOfFinalSum(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateHighestMagnitudeTwoNumbersSum(input);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateMagnitudeOfFinalSum,
    calculateHighestMagnitudeTwoNumbersSum, calculateSumOfNumbers, NumberTree}