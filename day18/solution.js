const path = require('path');
const fs = require("fs");
const assert = require("assert");

function loadData(fileName) {
    return parseData(fs
        .readFileSync(path.join(__dirname, fileName), "utf-8")
        .toString())
}

class Node {
    constructor(data) {
        this.data = data
        this.parent = null
        this.left = null
        this.right = null
    }
}

class NumberTree {
    constructor() {
        this.root = null
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
            }
            else if (c === ']') {
                currentNode = currentNode.parent
            }
            else if (isCharNumber(c)) {
                currentNode.data = parseInt(c, 10)
            }
            else if (c === ',') {
                currentNode = currentNode.parent
                let newNode = new Node(null)
                newNode.parent = currentNode
                currentNode.right = newNode
                currentNode = newNode
            }
            else {
                assert(false)
            }
        }
        return this
    }

    reduce() {

    }

    convertToNumberString() {
        let res = ""
        let current_node = this.root

        let stack = []

        // Mode indicates how current_node was already processed
        const mode_entered_none = 0     // first time enter
        const mode_entered_left = 1     // it was on stack after processing left sub tree
        const mode_entered_right = 2    // it was on stack after processing left and also right trees
        let mode = mode_entered_none

        while(current_node) {

           if (mode === mode_entered_none) {
                if (current_node.left === null) {
                    res += current_node.data
                    current_node = current_node.right
                    if (current_node == null)
                        [mode, current_node] = stack.pop()
                }
                else {
                    res += "["
                    stack.push([mode_entered_left, current_node])
                    current_node = current_node.left
                }
            }

            else if (mode === mode_entered_left) {
               if (current_node.left && current_node.right)
                   res += ","

                if (current_node.right == null) {
                    res += current_node.data
                    res += "]"
                    [mode, current_node] = stack.pop()
                }
                else {
                    stack.push([mode_entered_right, current_node])
                    mode = mode_entered_none
                    current_node = current_node.right
                }
            }

            else if (mode === mode_entered_right) {
               res += "]"
               current_node = null
               if (stack.length !== 0)
                   [mode, current_node] = stack.pop()
           }
        }
        return res
    }

    magnitude() {
        return 0
    }
}

function testNumberTree(data) {

    let test_arr = [
        "[1,2]",
        "[[1,2],3]",
        "[9,[8,7]]",
        "[[1,9],[8,5]]",
        "[[[[1,2],[3,4]],[[5,6],[7,8]]],9]",
        "[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]",
        "[[[[1,3],[5,3]],[[1,3],[8,7]]],[[[4,9],[6,9]],[[8,2],[7,3]]]]"
    ]

    test_arr = data.concat(test_arr)

    data.forEach((num1, index) => {
        let t1 = new NumberTree()
        t1.parseFromNumberString(num1)
        let t1_v = t1.convertToNumberString()
        if (num1 != t1_v) {
            console.log(`failed: ${index}: ${num1}`)
            assert(false)
        }
    })
}

function isCharNumber(c) {
    return c >= '0' && c <= '9';
}

function parseData(data) {
    return data.split('\n')
}

function calculateMagnitudeOfFinalSum(numbers) {
    let num1 = numbers[0]
    for (let n = 1; n < numbers.length; ++n) {
        let num1PlusN = `[${num1},${numbers[n]}]`
        let number_tree = new NumberTree()
        number_tree.parseFromNumberString(num1PlusN)
        number_tree.reduce()
        num1 = number_tree.convertToNumberString()
    }
    return new NumberTree().parseFromNumberString(num1).magnitude()
}

function run() {
    console.log("\nDay 18")

    let input = loadData('data.txt')
    let val = calculateMagnitudeOfFinalSum(input);
    console.log(`Part 1: ${val}`)
    assert(val === 3916)

    input = loadData('data.txt', true)
    val = calculateMagnitudeOfFinalSum(input);
    console.log(`Part 2: ${val}`)
    assert(val === 2986)
}

module.exports = { run, loadData, parseData, calculateMagnitudeOfFinalSum, testNumberTree}