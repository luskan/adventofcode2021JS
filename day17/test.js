var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 17");

    // part1
    let res

    res = solution.calculateHighestYTrajectory(solution.parseData("target area: x=20..30, y=-10..-5")).max_h
    assert(res === 45)

    // part2
    res = solution.calculateHighestYTrajectory(solution.parseData("target area: x=20..30, y=-10..-5")).vel_count
    assert(res === 112)
}

module.exports = { runTest };