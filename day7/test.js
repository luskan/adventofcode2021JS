var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 7");

    let res = solution.calculateRequiredCrabSubmarinesFuel(solution.loadData("./data_test.txt"), false)
    assert(res === 37)

    res = solution.calculateRequiredCrabSubmarinesFuel(solution.loadData("./data_test.txt"), true)
    assert(res === 168)
}

module.exports = { runTest };