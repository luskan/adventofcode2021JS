var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 15");

    // part1
    let res = solution.calculateLowerRiskPathCost(solution.loadData("./data_test.txt", false))
    assert(res === 40)

    // part2
    res = solution.calculateLowerRiskPathCost(solution.loadData("./data_test.txt", true))
    assert(res === 315)
}

module.exports = { runTest };