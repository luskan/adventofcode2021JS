var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 20");

    // part1
    let res = solution.calculateNumberOfLitPixels(solution.loadData('data_test.txt'), 2)
    assert(res === 35)

    // part2
    res = solution.calculateNumberOfLitPixels(solution.loadData('data_test.txt'), 50)
    assert(res === 3351)
}

module.exports = { runTest };