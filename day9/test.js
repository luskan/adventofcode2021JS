var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 9");

    // part1
    let res = solution.calculateSumOfRiskLevels(solution.loadData("./data_test.txt"))
    assert(res === 15)


    // part2
    res = solution.calculateMultiplyOfThreeLargestBasins(solution.loadData("./data_test.txt"))
    assert(res === 1134)
}

module.exports = { runTest };