const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .trim()
        .split('\n');
}

function calculateGammaAndEpsilonMultiplied(input) {
    const one_counts = _.reduce(input,(counts, bin_str) => {
        for (let n = 0; n < bin_str.length; ++n) {
            if (bin_str[n] === '1')
                counts[n]++
        }
        return counts;
    }, new Array(input[0].length).fill(0));
    const total_entries = input.length
    const gamma_str = _.reduce(one_counts,(gamma_str, one_count) => {
        gamma_str += (one_count > total_entries / 2) ? '1' : '0'
        return gamma_str
    }, "");
    const epsilon_str = _.map(gamma_str, (c) => { return c === '1' ? '0' : '1' }).join("")
    const gamma = parseInt(gamma_str, 2);
    const epsilon = parseInt(epsilon_str, 2);
    return gamma * epsilon;
}

function calculateOxygenGeneratorAndCO2ScrubberRatingsMultiplied(input) {
    const total_bits = input[0].length
    let oxygen_entries = [...input]
    let co2_entries = [...input]
    for (let bit = 0; bit < total_bits; bit++) {
        const reducer_fn = function (entries, bit, most_common_bit) {
            const one_counts = _.reduce(entries, (counts, bin_str) => counts + (bin_str[bit] === '1' ? 1 : 0), 0);
            const zero_counts = entries.length - one_counts
            let bit_value_to_keep = '?'
            if (most_common_bit)
                bit_value_to_keep = one_counts >= zero_counts ? '1' : '0'
            else
                bit_value_to_keep = one_counts < zero_counts ? '1' : '0'
            return _.reduce(entries, (ratings, entry) => {
                if (entry[bit] === bit_value_to_keep)
                    ratings.push(entry)
                return ratings
            }, [])
        };

        if (oxygen_entries.length > 1)
            oxygen_entries = reducer_fn(oxygen_entries, bit, true)
        if (co2_entries.length > 1)
            co2_entries = reducer_fn(co2_entries, bit, false)
    }

    const oxygen = parseInt(oxygen_entries[0], 2);
    const co2 = parseInt(co2_entries[0], 2);
    return oxygen * co2;
}

function run() {
    const input = loadData('data.txt')

    console.log("\nDay 3")

    let val = calculateGammaAndEpsilonMultiplied(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateOxygenGeneratorAndCO2ScrubberRatingsMultiplied(input)
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateGammaAndEpsilonMultiplied, calculateOxygenGeneratorAndCO2ScrubberRatingsMultiplied}