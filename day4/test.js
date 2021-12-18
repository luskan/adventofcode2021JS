var solution = require('./solution');
const assert = require("assert");

function runTest() {
    let res = solution.calculateWiningBoard(solution.loadData("./data_test.txt"), false)
    assert(res === 4512)

    res = solution.calculateWiningBoard(solution.loadData("./data_test.txt"), true)
    assert(res === 1924)
}

module.exports = { runTest };