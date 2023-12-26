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
    let isTemplate = true
    let template = ""
    let replace_rule = {}
    data.split('\n')
        .forEach((line) => {
            if (line.length === 0) {
                isTemplate = false
                return
            }
            if (isTemplate) {
                template = line
            }
            else {
                let m = line.match(/(\w{2}) -> (\w)/)
                // replace_rule["NN"] = "NC" "CN"
                replace_rule[m[1]] = {
                    r1: m[1][0] + m[2],
                    r2: m[2] + m[1][1]
                }
            }
        })

    return {template_line: template, replace_rule_data: replace_rule}
}

function calculateTheSolution(data, part2) {
    let template = data.template_line
    let replace_rule = data.replace_rule_data

    // Dictionary which counts number of letters in the template.
    let counter = {}

    // Helper lambda to increment counts
    let inc = (c,cntr,val) => {
        if (c in cntr)
            cntr[c] += val
        else
            cntr[c] = val
    }

    // Dictionary holding pairs of letters with counts:
    // NNCB will be :
    //  NN: 1
    //  NC: 1
    //  CB: 1
    let pairDict = {}
    for (let k = 0; k < template.length-1; ++k) {
        let pair = template.substr(k, 2)
        inc(pair, pairDict,  1)
        inc(pair[0],counter,1)
    }
    inc(template.at(-1), counter, 1)

    let times = part2 ? 40 : 10
    while(times--) {
        let pairDict2 = {}

        // Now iterate all the pairs
        _.chain(pairDict).each((count,pair) => {

            // If there is a rule for this pair
            if (pair in replace_rule) {

                // Then use this rule to make two new pairs with counts equal to parent counts
                let rl = replace_rule[pair]
                inc(rl.r1, pairDict2, count)
                inc(rl.r2, pairDict2, count)

                // Increment letter counter for the new (middle) letter with number of parent count
                // (rl.r1[1] because the new letter is the one on the right of r1)
                inc(rl.r1[1], counter, count)
            } else {

                // No rule for this pair, so copy the count
                // (actually it never gets executed...)
                pairDict2[pair] = count
            }
        })
        pairDict = pairDict2
    }

    let max_element = _.max(counter, (c) => c)
    let min_element = _.min(counter, (c) => c)

    return max_element - min_element
}

function run() {
    console.log("\nDay 14")

    let input = loadData('data.txt')
    let val = calculateTheSolution(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateTheSolution(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateTheSolution}

