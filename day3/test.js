var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 3");

    const res = solution.calculateGammaAndEpsilonMultiplied(solution.loadData("./data_test.txt"))
    assert(res === 198)

    const res2 = solution.calculateOxygenGeneratorAndCO2ScrubberRatingsMultiplied(solution.loadData("./data_test.txt"))
    assert(res2 === 230)
}

module.exports = { runTest };