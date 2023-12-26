var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 6");

    let res = solution.calculateNumberOfLanternfishes(solution.loadData("./data_test.txt"), 80, false)
    assert(res === 5934)

    res = solution.calculateNumberOfLanternfishes(solution.loadData("./data_test.txt"), 256, true)
    assert(res === 26984457539)
}

module.exports = { runTest };