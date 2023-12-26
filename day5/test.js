var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 5");

    let res = solution.calculateOverlappingPoints(solution.loadData("./data_test.txt"), false)
    assert(res === 5)

    res = solution.calculateOverlappingPoints(solution.loadData("./data_test.txt"), true)
    assert(res === 12)
}

module.exports = { runTest };