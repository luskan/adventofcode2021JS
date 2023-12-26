const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString())
}

function parseData(data) {
    return data
        .split('\n')
        .map((line) => {
            let line_split = line.split('|')
            return {
                patterns: line_split[0].trim().split(' '),
                output: line_split[1].trim().split(' ')
            }
        })
}

// Part 1
function calculateOutputDigitsCount(input) {
    const chars_eight = "fdgacbe"
    const chars_len_eight = chars_eight.length

    const chars_four = "gcbe"
    const chars_len_four = chars_four.length

    const chars_seven = "cgb"
    const chars_len_seven = chars_seven.length

    const chars_one = "gc"
    const chars_len_one = chars_one.length

    const simple_digits = [chars_len_eight, chars_len_four, chars_len_seven, chars_len_one]

    return input.reduce((mem, v) => {
        return mem + v.output.reduce((mem2, v2) => mem2 + simple_digits.includes(v2.length), 0)
    }, 0)
}

// Part 2
function calculateOutputValuesSum(input) {
    return input.reduce((mem, v) => {

       /*
         Segments (a,b,c,d,e,f,g) in a correct one digit display:
         aaaa
        b    c
        b    c
         dddd
        e    f
        e    f
         gggg
        */

        // There are four digits of unique segment lengths, so they are easy to discern:
        // two chars - for digit 1
        // four chars - for digit 4
        // eight chars - for digit 8
        // three chars - for digit 7

        // Below variables (and later similarly named) will hold chars for given digits
        let one_chars = _.find(v.patterns, (a) => a.length === 2)
        let four_chars = _.find(v.patterns, (a) => a.length === 4)
        let seven_chars = _.find(v.patterns, (a) => a.length === 3)
        let eight_chars = _.find(v.patterns, (a) => a.length === 7)

        //
        // Now, lets start classification....

        // First the most basic case. Segment a is the one which exists in 7 but not in 1
        let seg_a = _.reject(seven_chars, (c) => one_chars.includes(c))[0]

        // There are three digits with 6 segments: 0,6,9. Only digit 6 has no c segment,
        // so we can find six digit by checking if any of those three digits misses one
        // of the segment from digit one.
        let six_chars =
            _.reject(
                // Find those digits which has 6 segments (those are candidates for 0,6,9)
                _.filter(v.patterns, (s) => s.length === 6),
                // From the three found, reject those which has both segments from one digit segments
                (c) => _.countBy(c, (s1) => one_chars.includes(s1))[true] === 2 )[0]

        // Segment c is the one which exists in 1 but not in 6
        let seg_c = _.reject(one_chars, (c) => six_chars.includes(c))[0]

        // Segment f is the one which exists in 1 but is not equal to segment c
        let seg_f = _.reject(one_chars, (c) => seg_c.includes(c) )[0]

        // Now to find segment d, we will find digit 3 and then will find a common segment with digit 4 after
        // removing segments a,c,f
        let three_chars =
            _.reject(
                // candidates with 5 segments are digits: 3,2,5
                _.filter(v.patterns, (s) => s.length === 5),
                // To find 3 we check if after removing known segments a,c,f - only two segments are left
                (c) => _.countBy(c, (s1) => seg_a===s1||seg_c===s1||seg_f===s1)[true] === 2
            )[0]

        // Segment d is the one which is common in digits 3 and 4, after removing segments a,c,f
        let seg_d = _.intersection(
            _.reject(three_chars, (c) => seg_a===c||seg_c===c||seg_f===c ),
            _.reject(four_chars, (c) => seg_a===c||seg_c===c||seg_f===c )
        )[0]

        // Deduce segments g,b,e by removing known (above) segments from known digits
        let seg_g = _.reject(three_chars, (c) => seg_a===c||seg_c===c||seg_f===c||seg_d===c )[0]
        let seg_b = _.reject(four_chars, (c) => seg_c===c||seg_f===c||seg_d===c )[0]
        let seg_e = _.reject(eight_chars, (c) => seg_a===c||seg_b===c||seg_c===c||seg_d===c||seg_f===c||seg_g===c )[0]

        // Now, when we have all the segments deduced, build the rest of the digits
        let two_chars = _.find(v.patterns,
            (a) => a.length === 5 && _.every(a, (n) => [seg_a, seg_c, seg_d, seg_e, seg_g].includes(n)) )
        let five_chars = _.find(v.patterns,
            (a) => a.length === 5 && _.every(a, (n) => [seg_a, seg_b, seg_d, seg_f, seg_g].includes(n)) )
        let nine_chars = _.find(v.patterns,
            (a) => a.length === 6 && _.every(a, (n) => [seg_a, seg_b, seg_c, seg_d, seg_f, seg_g].includes(n)) )
        let zero_chars = _.find(v.patterns,
            (a) => a.length === 6 && _.every(a, (n) => [seg_a, seg_b, seg_c, seg_e, seg_f, seg_g].includes(n)) )

        // Now pack all the digits in a map (make the keys sorted)
        let values = {}
        _.each([zero_chars, one_chars, two_chars, three_chars, four_chars, five_chars, six_chars,
            seven_chars, eight_chars, nine_chars],
            (c) => values[c.split('').sort().join('')] = Object.keys(values).length)

        // Now map the visual segments to the deduced above digit segemnts
        return mem + v.output.reduce((mem2, v2) => {
            let v2s = v2.split('').sort().join('')
            if (!(v2s in values)) {
                assert(false)
            }
            let v2v = values[v2s]
            res = (mem2 * 10) + v2v
            return res
        }, 0)
    }, 0)
}

function run() {
    input = loadData('data.txt')

    console.log("\nDay 8")

    let val = calculateOutputDigitsCount(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateOutputValuesSum(input);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateOutputDigitsCount, calculateOutputValuesSum}