var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 19");

    // part1
    res_data = solution.calculateScannersAndBeacons(solution.loadData('data_test.txt'))
    assert(res_data.beacons.size === 79)

    // part2
    let res = solution.calculateBeaconsMaxManhatanDistance(res_data)
    assert(res === 3621)
}

module.exports = { runTest };