var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 21");

    // part1
    //let res = solution.calculateGameResultForPart1(solution.loadData('data_test.txt'))
    //assert(res === 739785)

    let res = solution.calculateGameResultForPart2(solution.loadData('data_test.txt'))
    assert(res === 444356092776315)

}

module.exports = { runTest };