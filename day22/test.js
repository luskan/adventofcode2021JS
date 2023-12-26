var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 22");

    let test1 = `
    on x=10..12,y=10..12,z=10..12
    on x=11..13,y=11..13,z=11..13
    off x=9..11,y=9..11,z=9..11
    on x=10..10,y=10..10,z=10..10
    `

    // part1
    let res = solution.calculateCubesInOnState(solution.parseData(test1.split('\n')), true)
    assert(res === 39)

    let res2 = solution.calculateCubesInOnState(solution.loadData('data_test.txt'), true)
    assert(res2 === 590784)

    // part2
    let res3 = solution.calculateCubesInOnState(solution.loadData('data_test2.txt'), false)
    assert(res3 === 2758514936282235)
}

module.exports = { runTest };