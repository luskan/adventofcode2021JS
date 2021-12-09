var solution = require('./solution');
const assert = require("assert");

function runTest() {
    const res = solution.calculateGammaAndEpsilonMultiplied(solution.loadData("./data_test.txt"))
    assert(res === 198)

    const res2 = solution.calculateOxygenGeneratorAndCO2ScrubberRatingsMultiplied(solution.loadData("./data_test.txt"))
    assert(res2 === 230)
}

module.exports = { runTest };