var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 8");

    // part1
    let res = solution.calculateOutputDigitsCount(solution.loadData("./data_test.txt"))
    assert(res === 26)

    // part2
    let test1 = "acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf"
    res = solution.calculateOutputValuesSum(solution.parseData(test1))
    assert(res === 5353)

    res = solution.calculateOutputValuesSum(solution.loadData("./data_test.txt"))
    assert(res === 61229)
}

module.exports = { runTest };