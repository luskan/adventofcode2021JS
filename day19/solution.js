const path = require('path');
const fs = require("fs");
const _ = require("underscore");
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .trim()
        .toString().split('\n'))
}

function parseData(data) {
    let scanners = {}
    let current_scanner_id = 0
    let rg_scanner = /--- scanner (?<id>\d+) ---/;
    let rg_location = /(?<x>[-\d]+),(?<y>[-\d]+),(?<z>[-\d]+)/;
    _.reduce(data, (sc, line) => {
        let m = rg_scanner.exec(line)
        if (m) {
            current_scanner_id = parseInt(m.groups.id, 10)
            scanners[current_scanner_id] = []
        } else {
            let m = rg_location.exec(line)
            if (m) {
                assert(current_scanner_id in scanners)
                scanners[current_scanner_id].push({
                    x: parseInt(m.groups.x, 10),
                    y: parseInt(m.groups.y, 10),
                    z: parseInt(m.groups.z, 10)
                })
            }
        }
        return sc
    }, scanners);
    _.each(scanners, (scanner) => {
        sortPointsArray(scanner)
    })
    return scanners
}

function sortPointsArray(pointsArray) {
    pointsArray.sort((p1, p2) => {
        if (p1.x === p2.x) {
            if (p1.y === p2.y) {
                if (p1.z === p2.z) {
                    return true
                }
                else {
                    return p1.z < p2.z
                }
            }
            else {
                return p1.y < p2.y
            }
        }
        else {
            return p1.x < p2.x
        }
    })
}

let position_variant_indexes =
    [[0, 1, 2], // 'xyz'
        [0, 2, 1], // 'xzy'
        [1, 0, 2], // 'yxz'
        [1, 2, 0], // 'yzx'
        [2, 0, 1], // 'zxy'
        [2, 1, 0]] // 'zyx'

let index_name = ["x", "y", "z"]
function setPositionVariant(pos_in, pos_out, rot) {
    pos_out.x = pos_in[index_name[position_variant_indexes[rot][0]]]
    pos_out.y = pos_in[index_name[position_variant_indexes[rot][1]]]
    pos_out.z = pos_in[index_name[position_variant_indexes[rot][2]]]
}

let to_negate_indexes =
    [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1]
    ]

function setPositionSignVariant(pos, rot) {
    if (to_negate_indexes[rot][0] === 1)
        pos.x = -pos.x
    if (to_negate_indexes[rot][1] === 1)
        pos.y = -pos.y
    if (to_negate_indexes[rot][2] === 1)
        pos.z = -pos.z
}

function setBeaconsCoordinatesVariant(input, output, rot) {
    _.each(input, (pos, index) => setPositionVariant(pos, output[index], rot))
}

function setBeaconsCoordinatesSignVariant(output, size, rot) {
    for (let n = 0; n < size; ++n) {
        setPositionSignVariant(output[n], rot)
    }
}

// Optimization: array used instead of map
let x_arr = Array.apply(null, Array(4000)).map(function (x, i) { return i; })
let y_arr = Array.apply(null, Array(4000)).map(function (x, i) { return i; })
let z_arr = Array.apply(null, Array(4000)).map(function (x, i) { return i; })

x_arr.fill(0)
y_arr.fill(0)
z_arr.fill(0)

// Optimization: to avoid x_arr/y_arr/z_arr clearing we maintain inc_arr sentinel which informs if cell
//               is active for current iteration
let inc_arr = 0

let beacons_copy = Array.apply(null, Array(30)).map(function () {
    return {
        x: 0,
        y: 0,
        z: 0
    };
})

function findBeaconsUnion(input, scanner_index_1, scanner_index_2, known_scanners, known_beacons) {
    let scanner_1_beacons = input[scanner_index_1]
    let v12_x = -1;
    let v12_y = -1;
    let v12_z = -1;
    let match_found = false;
    let pos_1;

    for (let rot1 = 0; rot1 < position_variant_indexes.length; ++rot1) {
        for (let rot2 = 0; rot2 < to_negate_indexes.length; ++rot2) {
            setBeaconsCoordinatesVariant(input[scanner_index_2], beacons_copy, rot1)
            setBeaconsCoordinatesSignVariant(beacons_copy, input[scanner_index_2].length, rot2)

            v12_x = -1;
            v12_y = -1;
            v12_z = -1;
            match_found = false;
            inc_arr+=100

            for (let b1 = 0; b1 < scanner_1_beacons.length; ++b1) {
                for (let b2 = 0; b2 < input[scanner_index_2].length; ++b2) {
                    pos_1 = scanner_1_beacons[b1]

                    v12_x = (pos_1.x - beacons_copy[b2].x) + 2000
                    v12_y = (pos_1.y - beacons_copy[b2].y) + 2000
                    v12_z = (pos_1.z - beacons_copy[b2].z) + 2000

                    if (x_arr[v12_x] < inc_arr)
                        x_arr[v12_x] = inc_arr;
                    x_arr[v12_x]++

                    if (y_arr[v12_y] < inc_arr)
                        y_arr[v12_y] = inc_arr;
                    y_arr[v12_y]++

                    if (z_arr[v12_z] < inc_arr)
                        z_arr[v12_z] = inc_arr;
                    z_arr[v12_z]++

                    if (x_arr[v12_x] >= inc_arr && y_arr[v12_y] >= inc_arr && z_arr[v12_z] >= inc_arr) {
                        if (x_arr[v12_x] - inc_arr >= 12 && y_arr[v12_y] - inc_arr >= 12 && z_arr[v12_z] - inc_arr >= 12) {
                            match_found = true
                            b1 = scanner_1_beacons.length
                            b2 = input[scanner_index_2].length
                        }
                    }
                }
            }

            if (match_found) {
                let vec = {x: v12_x-2000, y: v12_y-2000, z: v12_z-2000}

                let scanner_1 = _.find(known_scanners, (obj) => obj.id === scanner_index_1)
                let vec_total = vec
                vec_total.x += scanner_1.vec.x;
                vec_total.y += scanner_1.vec.y;
                vec_total.z += scanner_1.vec.z;

                //assert(_.find(known_scanners, (obj) => obj.id === scanner_index_2) === undefined)

                for (let n = 0; n < input[scanner_index_2].length; ++n) {
                    input[scanner_index_2][n].x = beacons_copy[n].x
                    input[scanner_index_2][n].y = beacons_copy[n].y
                    input[scanner_index_2][n].z = beacons_copy[n].z
                }
                let new_scanner = {
                    "id": scanner_index_2,
                    "vec": vec_total,
                    "rot": [rot1],
                    "rot_negate": [rot2]
                }
                known_scanners.push(new_scanner)

                // Add all the beacons from this scanner perspective. Their positions/orientations/facing is relative
                // to zeroth scanner. Any duplicates from other scanners are being removed (known_beacons is a set).
                //let prev_count = known_beacons.size

                for (let n = 0; n < input[scanner_index_2].length; ++n) {
                    let pos = beacons_copy[n]
                    let pos2 = {...pos}
                    pos2.x += vec_total.x
                    pos2.y += vec_total.y
                    pos2.z += vec_total.z
                    let b2_pos_str = JSON.stringify(pos2)
                    known_beacons.add(b2_pos_str)
                }

                //let added_beacons = (known_beacons.size - prev_count)
                //console.log(`For: ${scanner_index_1} with ${scanner_index_2} added_beacons:${added_beacons} rot1:${rot1} rot2:${rot2} vec: x=${vec_total.x},y=${vec_total.y},z=${vec_total.z}`)

                return true
            }

        }
    }

    //console.log(`For: ${scanner_index_1} with ${scanner_index_2} - NONE!`)

    return false
}

function calculateScannersAndBeacons(input) {
    let known_scanners = [
        {
            id: 0,
            vec: {x: 0, y: 0, z: 0},
            rot: [0],
            rot_negate: [0]
        }
    ]

    let known_beacons = new Set()
    let were_checked_against = {}
    let scanners_count = Object.keys(input).length

    // Add all the beacons visible from the zero-th scanner. Their coordinates are already at the proper
    // coordinates and orientation/facing.
    input[0].forEach((org_pos) => {
        let pos = {...org_pos}
        known_beacons.add(JSON.stringify(pos))
    })

    let scanners_to_check = []
    let checked_scanners = new Set
    scanners_to_check.push(0)

    while (scanners_to_check.length !== 0) {
        let n = scanners_to_check.pop()
        checked_scanners.add(n)

        for (let k = 0; k < scanners_count; ++k) {

            // Do not check scanner against itself, and dont check scanner mutually
            if (n === k || `${n}_${k}` in were_checked_against)
                continue;
            were_checked_against[`${n}_${k}`] = 1
            were_checked_against[`${k}_${n}`] = 1

            // Dont check against scanners which position is already calculated
            if (_.find(known_scanners, (scanner) => scanner.id === k) !== undefined)
                continue

            // Find same beacons
            if (findBeaconsUnion(input, n, k, known_scanners, known_beacons))
                scanners_to_check.push(k)
        }
    }

    return {beacons: known_beacons, scanners: known_scanners}
}

function calculateBeaconsMaxManhatanDistance(beacons_and_scanners_data) {
    let scanners_positions = []
    beacons_and_scanners_data.scanners.forEach((s) => scanners_positions.push(s.vec))
    let max_dist = -1
    for (let n = 0; n < scanners_positions.length; ++n) {
        for (let k = 0; k < scanners_positions.length; ++k) {
            let dx = scanners_positions[n].x - scanners_positions[k].x
            let dy = scanners_positions[n].y - scanners_positions[k].y
            let dz = scanners_positions[n].z - scanners_positions[k].z
            let sum = Math.abs(dx) + Math.abs(dy) + Math.abs(dz)
            if (sum > max_dist)
                max_dist = sum
        }
    }
    return max_dist
}

function run() {
    console.log("\nDay 19")

    let input = loadData('data.txt')
    let res_data = calculateScannersAndBeacons(input);
    console.log(`Part 1: ${res_data.beacons.size}`)
    assert(res_data.beacons.size === common.getResultIntFromFile(__dirname, "1"))

    let val = calculateBeaconsMaxManhatanDistance(res_data);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateScannersAndBeacons, calculateBeaconsMaxManhatanDistance}