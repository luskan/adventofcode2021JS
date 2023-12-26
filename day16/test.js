var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 16");

    // part1
    let res

    res = solution.calculateSumOfVersionNumbers(solution.parseData("D2FE28"))
    assert(res === 6)

    res = solution.calculateSumOfVersionNumbers(solution.parseData("38006F45291200"))
    assert(res === 9)

    res = solution.calculateSumOfVersionNumbers(solution.parseData("EE00D40C823060"))
    assert(res === 14)

    res = solution.calculateSumOfVersionNumbers(solution.parseData("8A004A801A8002F478"))
    assert(res === 16)

    res = solution.calculateSumOfVersionNumbers(solution.parseData("620080001611562C8802118E34"))
    assert(res === 12)

    res = solution.calculateSumOfVersionNumbers(solution.parseData("C0015000016115A2E0802F182340"))
    assert(res === 23)

    res = solution.calculateSumOfVersionNumbers(solution.parseData("A0016C880162017C3686B18A3D4780"))
    assert(res === 31)


    // part2
    res = solution.evaluateExpressionOfMessage(solution.parseData("C200B40A82"))
    assert(res === 3)

    res = solution.evaluateExpressionOfMessage(solution.parseData("04005AC33890"))
    assert(res === 54)

    res = solution.evaluateExpressionOfMessage(solution.parseData("880086C3E88112"))
    assert(res === 7)

    res = solution.evaluateExpressionOfMessage(solution.parseData("CE00C43D881120"))
    assert(res === 9)

    res = solution.evaluateExpressionOfMessage(solution.parseData("D8005AC2A8F0"))
    assert(res === 1)

    res = solution.evaluateExpressionOfMessage(solution.parseData("F600BC2D8F"))
    assert(res === 0)

    res = solution.evaluateExpressionOfMessage(solution.parseData("9C005AC2F8F0"))
    assert(res === 0)

    res = solution.evaluateExpressionOfMessage(solution.parseData("9C0141080250320F1802104A08"))
    assert(res === 1)

}

module.exports = { runTest };