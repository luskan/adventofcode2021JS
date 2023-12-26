var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 2");

    const res = solution.calculateMulOfDepthAndDistance(solution.loadData("./data_test.txt"))
    assert(res === 150)

    const res2 = solution.calculateMulOfDepthAndDistancePart2(solution.loadData("./data_test.txt"))
    assert(res2 === 900)
}

module.exports = { runTest };