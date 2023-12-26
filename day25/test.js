var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 25");

    let res = solution.calculateStepNumber(solution.loadData("./data_test.txt"))
    assert(res === 58)
}

module.exports = { runTest };