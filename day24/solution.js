const assert = require("assert");
const fs = require("fs");
const path = require("path");
const common = require('../common');

function loadData(fileName, actual_problem) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .split('\n'), actual_problem)
}

const OPCODE_INP = 0;
const OPCODE_ADD = 1;
const OPCODE_MUL = 2;
const OPCODE_DIV = 3;
const OPCODE_MOD = 4;
const OPCODE_EQL = 5;

const MEM_W = 0
const MEM_X = 1
const MEM_Y = 2
const MEM_Z = 3

const IS_VAL = 0
const IS_REG = 1

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function parseData(data, actual_problem) {
    let program = {
        instructions: [],
        inp_indexes: [],
        inp_values: []
    }

    let opcodes_mapper = {
        inp: OPCODE_INP,
        add: OPCODE_ADD,
        mul: OPCODE_MUL,
        div: OPCODE_DIV,
        mod: OPCODE_MOD,
        eql: OPCODE_EQL
    }

    let mem_mapper = {
        w: MEM_W,
        x: MEM_X,
        y: MEM_Y,
        z: MEM_Z
    }

    data.forEach((line) => {
        line = line.trim()
        if (line.length !== 0) {
            let code = line.trim().split(' ')
            let code_parsed = [opcodes_mapper[code[0]]]
            for (let n = 1; n < code.length; ++n) {
                if (isNumeric(code[n]))
                    code_parsed.push([IS_VAL, parseInt(code[n])])
                else
                    code_parsed.push([IS_REG, mem_mapper[code[n]]])
            }
            program.instructions.push(code_parsed)
            if (code_parsed[0] === OPCODE_INP)
                program.inp_indexes.push(program.instructions.length - 1)
        }
    })

    if (actual_problem) {
        for (let k = 0; k < program.inp_indexes.length; ++k) {
            let inp_index = program.inp_indexes[k]
            let val1 = program.instructions[inp_index + 4][2][1]
            let val2 = program.instructions[inp_index + 5][2][1]
            let val3 = program.instructions[inp_index + 15][2][1]
            program.inp_values.push([val1, val2, val3])
        }
    }

    return program
}

function execute_instruction(program, pc, pc_input, output) {
    let read_val = (mem) => {
        if (mem[0] === IS_VAL)
            return mem[1]
        else
            return output[mem[1]]
    }

    let cod = program[pc]
    switch (cod[0]) {
        case OPCODE_INP:
            let new_value = pc_input[pc_input[0]++]
            output[cod[1][1]] = new_value
            break;
        case OPCODE_ADD:
            output[cod[1][1]] = read_val(cod[1]) + read_val(cod[2])
            break;
        case OPCODE_MUL:
            output[cod[1][1]] = read_val(cod[1]) * read_val(cod[2])
            break;
        case OPCODE_DIV:
            let divident = read_val(cod[2])
            assert(divident !== 0)
            output[cod[1][1]] = Math.floor(read_val(cod[1]) / divident)
            break;
        case OPCODE_MOD:
            let op1 = read_val(cod[1])
            let op2 = read_val(cod[2])
            if (op1 < 0) {
                assert(op1 >= 0)
            }
            if (op2 <= 0) {
                assert(op2 > 0)
            }
            output[cod[1][1]] = op1 % op2
            break;
        case OPCODE_EQL:
            output[cod[1][1]] = read_val(cod[1]) === read_val(cod[2]) ? 1 : 0
            break;
    }
}

function run_program(program, input, output) {
    /*
    inp a - Read an input value and write it to variable a.
add a b - Add the value of a to the value of b, then store the result in variable a.
mul a b - Multiply the value of a by the value of b, then store the result in variable a.
div a b - Divide the value of a by the value of b, truncate the result to an integer, then store the result in variable a. (Here, "truncate" means to round the value toward zero.)
mod a b - Divide the value of a by the value of b, then store the remainder in variable a. (This is also called the modulo operation.)
eql a b - If the value of a and b are equal, then store the value 1 in variable a. Otherwise, store the value 0 in variable a.

    */

    let pc_input = [1, ...input]
    for (let pc = 0; pc < program.instructions.length; ++pc) {
        execute_instruction(program.instructions, pc, pc_input, output)
    }
}

function find_model_number(program, input, output, with_caching, cache) {
    /*
    inp a - Read an input value and write it to variable a.
add a b - Add the value of a to the value of b, then store the result in variable a.
mul a b - Multiply the value of a by the value of b, then store the result in variable a.
div a b - Divide the value of a by the value of b, truncate the result to an integer, then store the result in variable a. (Here, "truncate" means to round the value toward zero.)
mod a b - Divide the value of a by the value of b, then store the remainder in variable a. (This is also called the modulo operation.)
eql a b - If the value of a and b are equal, then store the value 1 in variable a. Otherwise, store the value 0 in variable a.

    */

    let current_value = 0

    let read_val = (mem) => {
        if (mem[0] === IS_VAL)
            return mem[1]
        else
            return output[mem[1]]
    }

    let program_start = 0
    if (with_caching) {
        let val = 0
        for (let k = 0; k < input.length; k++) {
            val *= 10
            val += input[k]
        }
        if (cache.has(val)) {

        }
    }

    let input_pos = 0
    for (let n = program_start; n < program.length; ++n) {
        let cod = program[n]
        switch (cod[0]) {
            case OPCODE_INP:
                let new_value = input[input_pos++]
                if (with_caching) {
                    if (current_value !== 0)
                        cache.set(current_value, [...output])
                    current_value *= 10
                    current_value += new_value
                }
                output[cod[1][1]] = new_value
                break;
            case OPCODE_ADD:
                output[cod[1][1]] = read_val(cod[1]) + read_val(cod[2])
                break;
            case OPCODE_MUL:
                output[cod[1][1]] = read_val(cod[1]) * read_val(cod[2])
                break;
            case OPCODE_DIV:
                output[cod[1][1]] = Math.floor(read_val(cod[1]) / read_val(cod[2]))
                break;
            case OPCODE_MOD:
                output[cod[1][1]] = read_val(cod[1]) % read_val(cod[2])
                break;
            case OPCODE_EQL:
                output[cod[1][1]] = read_val(cod[1]) === read_val(cod[2]) ? 1 : 0
                break;
        }
    }
}

function maxZForK(k) {
    let max_z = 0
    if (k === 13)
        max_z = 20
    else if (k === 12)
        max_z = 529
    else if (k === 11)
        max_z = 13764
    else if (k === 10)
        max_z = 529
    else if (k === 9)
        max_z = 13774
    else if (k === 8)
        max_z = 529
    else if (k === 7)
        max_z = 13775
    else if (k === 6)
        max_z = 358163
    else if (k === 5)
        max_z = 13775
    else if (k === 4)
        max_z = 529
    else if (k === 3)
        max_z = 13767
    else if (k === 2)
        max_z = 529
    else if (k === 1)
        max_z = 20
    return max_z
}

function maxVariantsForK(k) {
    let max_v = 0
    if (k === 13)
        max_v = 10
    else if (k === 12)
        max_v = 10
    else if (k === 11)
        max_v = 10
    else if (k === 10)
        max_v = 10
    else if (k === 9)
        max_v = 10
    else if (k === 8)
        max_v = 10
    else if (k === 7)
        max_v = 35
    else if (k === 6)
        max_v = 35
    else if (k === 5)
        max_v = 35
    else if (k === 4)
        max_v = 100
    else if (k === 3)
        max_v = 100
    else if (k === 2)
        max_v = 100
    else if (k === 1)
        max_v = 100
    else if (k === 0)
        max_v = 100
    return max_v
}

function calculateLargestModelNumber(program, part1) {
    /*
        The basic idea is to find what z-values are ending in 0, for the last digit. Then bactrack to find
        possible numbers backwards. The rest is lots of heuristics.

        Whole ALU program is divided into 14 sub programs, each of which is executed for each w input. Each differs
        from other programs by only three numbers.

        I found that there is a concept of variants which at the value of 100, makes the result correct to what
        server accepts. Giving more than 100 variants gives different results - even better than the one server
        accepts. ie. max value is greater than the one server accepts.
     */

    let cache = {}
    let z_cache = {}
    let results = []
    let next_k_z_cache = new Map()

    let compute_sub_prog = (val_z, val_w, val1, val2, val3) => {
        return Math.floor((((val_z % 26) + val2 === val_w) ? 0 : 1) * (val_z * 25 / val1 + val_w + val3) + val_z / val1)
    }

    for (let k = program.inp_indexes.length - 1; k >= 0; k--) {
        z_cache[k] = new Map()
        cache[k] = new Map()

        let min_z = 0
        let max_z = maxZForK(k)
        let maxVariants = part1 ? 1 : maxVariantsForK(k)

        // Store z-values that are possible to compute by next digit.
        // todo: yeah this could be reused later, but its so fast that I guess it would not make much difference
        next_k_z_cache.clear()
        {
            if (k !== 0) {
                let [val1, val2, val3] = program.inp_values[k - 1]
                let max_z = maxZForK(k - 1)
                for (let val_w = 1; val_w <= 9; val_w++) {
                    for (let val_z = min_z; val_z <= max_z; val_z++) {
                        let new_val_z = compute_sub_prog(val_z, val_w, val1, val2, val3)
                        next_k_z_cache.set(new_val_z, 1)
                    }
                }
            }
        }

        // Find correct digit for the current sub program
        let [val1, val2, val3] = program.inp_values[k]
        for (let val_w = 1; val_w <= 9; val_w++) {
            for (let val_z = min_z; val_z <= max_z; val_z++) {

                // Optimize by rejecting all the z values that will not be generated by next digit.
                if (k !== 0) {
                    if (!next_k_z_cache.has(val_z))
                        continue
                }

                let new_val_z = compute_sub_prog(val_z, val_w, val1, val2, val3)

                // Handle last digit which should result in z register being 0. Z-values giving this result
                // are candidates for the previous digit.
                if (k === program.inp_indexes.length - 1) {
                    if (new_val_z !== 0)
                        continue;
                    let key = (val_z * 10 + val_w) * 1000 /*+ 0*/
                    cache[k].set(key, val_w)
                    z_cache[k].set(val_z * 100 + val_w, 1)
                    continue
                }

                for (let next_k_w = 1; next_k_w <= 9; next_k_w += 1) {
                    if (!z_cache[k + 1].has(new_val_z * 100 + next_k_w))
                        continue;
                    for (let variant = 0; ; variant++) {
                        let key = (new_val_z * 10 + next_k_w) * 1000 + variant
                        if (cache[k + 1].has(key)) {
                            let number = cache[k + 1].get(key)
                            let number2 = Math.pow(10, 13 - k) * val_w + number
                            if (k === 0) {
                                results.push(number2)
                            } else {
                                let variant_val = 0
                                while (variant_val < maxVariants) {
                                    let key2 = (val_z * 10 + val_w) * 1000 + variant_val
                                    if (cache[k].has(key2) && !part1) {
                                        variant_val++
                                    } else {
                                        cache[k].set(key2, number2)
                                        break;
                                    }
                                }
                                z_cache[k].set(val_z * 100 + val_w, 1)
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    // Prepare results
    let min_value = Number.MAX_SAFE_INTEGER
    let max_value = -Number.MAX_SAFE_INTEGER
    results.forEach((value) => {
        min_value = Math.min(min_value, value)
        max_value = Math.max(max_value, value)
    })

    /*
    let reg = [0, 0, 0, 0]
    let max_value_tmp = max_value
    let num = []
    while (max_value_tmp) {
        num.splice(0, 0, max_value_tmp % 10)
        max_value_tmp = Math.floor(max_value_tmp / 10)
    }
    run_program(program, num, reg)
    console.log(`max: ${max_value} = ${reg[MEM_Z]}`)

    console.log(`max: ${max_value}`)
    console.log(`min: ${min_value}`)
     */

    return part1 ? max_value : min_value
}

function run() {
    console.log("\nDay 24")

    let input = loadData('data.txt', true)

    let max = calculateLargestModelNumber(input, true);
    console.log(`Part 1: ${max}`)
    assert(max === common.getResultIntFromFile(__dirname, "1"))

    let min = calculateLargestModelNumber(input, false);
    console.log(`Part 2: ${min}`)
    assert(min === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateLargestModelNumber, run_program, MEM_W, MEM_X, MEM_Y, MEM_Z}