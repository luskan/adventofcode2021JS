var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 23");

    let res1 = solution.calculateLeastEnergy(solution.loadData('data_test.txt', false), false)
    assert(res1 === 12521)

    let res2 = solution.calculateLeastEnergy(solution.loadData('data_test.txt', true), true)
    assert(res2 === 44169)
}

module.exports = { runTest };