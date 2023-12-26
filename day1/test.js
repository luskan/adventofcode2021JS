var day1 = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 1");

    const res = day1.calculateNumberOfIncreases(day1.loadData("./data_test.txt"))
    assert(res === 7)

    const res2 = day1.calculateNumberOfSlidingWindowIncreases(day1.loadData("./data_test.txt"))
    assert(res2 === 5)
}

module.exports = { runTest };