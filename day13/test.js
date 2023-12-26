var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 13");

    // part1
    let res = solution.calculateNumberOfDots(solution.loadData("./data_test.txt"), false)
    assert(res === 17)

    // part2
    res = solution.calculateNumberOfDots(solution.loadData("./data_test.txt"), true)
    assert(res === 16)
}

module.exports = { runTest };