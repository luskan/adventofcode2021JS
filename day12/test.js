var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 12");

    // part1
    let res = solution.calculateNumberOfPaths(solution.loadData("./data_test.txt"), false)
    assert(res === 10)

    // part2
    res = solution.calculateNumberOfPaths(solution.loadData("./data_test.txt"), true)
    assert(res === 36)

    let testData2 = `
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc
    `.trim()

    // part1
    res = solution.calculateNumberOfPaths(solution.parseData(testData2), false)
    assert(res === 19)

    // part2
    res = solution.calculateNumberOfPaths(solution.parseData(testData2), true)
    assert(res === 103)

    let testData3 = `
fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW
    `.trim()

    // part1
    res = solution.calculateNumberOfPaths(solution.parseData(testData3), false)
    assert(res === 226)

    // part2
    res = solution.calculateNumberOfPaths(solution.parseData(testData3), true)
    assert(res === 3509)


    // part2
    //res = solution.calculateNumberOfFlashesOrSyncStep(solution.loadData("./data_test.txt"), true)
    //assert(res === 195)
}

module.exports = { runTest };