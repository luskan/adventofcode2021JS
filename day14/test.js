var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 14");

    // part1
    let res = solution.calculateTheSolution(solution.loadData("./data_test.txt"), false)
    assert(res === 1588)

    // part2
    res = solution.calculateTheSolution(solution.loadData("./data_test.txt"), true)
    assert(res === 2188189693529)
}

module.exports = { runTest };