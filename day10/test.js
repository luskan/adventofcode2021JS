var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 10");

    // part1
    let res = solution.calculateSyntaxErrorScore(solution.loadData("./data_test.txt"), false)
    assert(res === 26397)


    // part2
    res = solution.calculateSyntaxErrorScore(solution.loadData("./data_test.txt"), true)
    assert(res === 288957)
}

module.exports = { runTest };