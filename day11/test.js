var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 11");

    // part1
    let res = solution.calculateNumberOfFlashesOrSyncStep(solution.loadData("./data_test.txt"), false)
    assert(res === 1656)


    // part2
    res = solution.calculateNumberOfFlashesOrSyncStep(solution.loadData("./data_test.txt"), true)
    assert(res === 195)
}

module.exports = { runTest };