var solution = require('./solution');
const assert = require("assert");
const common = require('../common');function runTest() {
    console.log("Run test 24");

    const prog1 = `
    inp x
    mul x -1
    `
    let reg = [0, 0, 0, 0]
    solution.run_program(solution.parseData(prog1.split('\n'), false), [123], reg)
    assert(reg[solution.MEM_X] === -123)

    const prog2 = `
    inp z
    inp x
    mul z 3
    eql z x
    `

    solution.run_program(solution.parseData(prog2.split('\n'), false), [3, 9], reg)
    assert(reg[solution.MEM_Z] === 1)
    solution.run_program(solution.parseData(prog2.split('\n'), false), [4, 9], reg)
    assert(reg[solution.MEM_Z] === 0)

    const prog3 = `
inp w
add z w
mod z 2
div w 2
add y w
mod y 2
div w 2
add x w
mod x 2
div w 2
mod w 2
    `
    reg = [0, 0, 0, 0]
    solution.run_program(solution.parseData(prog3.split('\n')), [0b1111], reg)
    assert(reg[solution.MEM_W] === 1)
    assert(reg[solution.MEM_X] === 1)
    assert(reg[solution.MEM_Y] === 1)
    assert(reg[solution.MEM_Z] === 1)

    reg = [0, 0, 0, 0]
    solution.run_program(solution.parseData(prog3.split('\n')), [0b1010], reg)
    assert(reg[solution.MEM_W] === 1)
    assert(reg[solution.MEM_X] === 0)
    assert(reg[solution.MEM_Y] === 1)
    assert(reg[solution.MEM_Z] === 0)

    //let res1 = solution.calculateLargestModelNumber(solution.loadData('data_test.txt'))
    //assert(res1 === 12521)

    //let res2 = solution.calculateLargestModelNumber(solution.loadData('data_test.txt'))
    //assert(res2 === 44169)
}

module.exports = { runTest };