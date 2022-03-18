var solution = require('./solution');
const assert = require("assert");

function runTest() {
    console.log("Run test 23");

    let res2 = solution.calculateLeastEnergy(solution.loadData('data_test.txt'), true)
    assert(res2 === 12521)
}

module.exports = { runTest };