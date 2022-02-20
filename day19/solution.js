const path = require('path');
const fs = require("fs");
//const StructsMap = goog.require('goog.structs.Map');
//const googIter = goog.require('goog.iter');
//const maps = goog.require('goog.collections.maps');
const _ = require("underscore");
const assert = require("assert");


function loadDataTest() {
    return parseDataTest("Some\ndata\nfile\n")
}

function parseDataTest(data) {
    data.split('\n')
}

function loadData(fileName) {
   // loadDataTest()

    return parseData(fs
        .readFileSync(path.join(__dirname, fileName), "utf-8")
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
        }
        else {
            let m = rg_location.exec(line)
            if (m) {
                if (!(current_scanner_id in scanners)) {
                    console.log("err!")
                }
                scanners[current_scanner_id].push({
                    x: parseInt(m.groups.x, 10),
                    y: parseInt(m.groups.y, 10),
                    z: parseInt(m.groups.z, 10)})
            }
        }
        return sc
    }, scanners);
    return scanners
}

function distance( v1, v2 ) {
    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = v1.z - v2.z;
    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function setPositionRotation(pos_in, pos_out, rot) {
    let negate = 1
    switch (rot) {
        case 4:
            negate = -1
        case 0:
            pos_out.x = pos_in.x * negate
            pos_out.y = pos_in.y
            pos_out.z = pos_in.z
            break;
        case 5:
            negate = -1
        case 1:
            pos_out.x = pos_in.x * negate
            pos_out.y = pos_in.z
            pos_out.z = -pos_in.y
            break;
        case 6:
            negate = -1
        case 2:
            pos_out.x = pos_in.x * negate
            pos_out.y = -pos_in.y
            pos_out.z = -pos_in.z
            break;
        case 7:
            negate = -1
        case 3:
            pos_out.x = pos_in.x * negate
            pos_out.y = -pos_in.z
            pos_out.z = pos_in.y
            break;

        case 12:
            negate = -1
        case 8:
            pos_out.x = pos_in.x
            pos_out.y = pos_in.y * negate
            pos_out.z = pos_in.z
            break;
        case 13:
            negate = -1
        case 9:
            pos_out.x = pos_in.z
            pos_out.y = pos_in.y * negate
            pos_out.z = -pos_in.x
            break;
        case 14:
            negate = -1
        case 10:
            pos_out.x = -pos_in.x
            pos_out.y = pos_in.y * negate
            pos_out.z = -pos_in.z
            break;
        case 15:
            negate = -1
        case 11:
            pos_out.x = -pos_in.z
            pos_out.y = pos_in.y * negate
            pos_out.z = pos_in.x
            break;

        case 20:
            negate = -1
        case 16:
            pos_out.x = pos_in.x
            pos_out.y = pos_in.y
            pos_out.z = pos_in.z * negate
            break;
        case 21:
            negate = -1
        case 17:
            pos_out.x = pos_in.y
            pos_out.y = -pos_in.x
            pos_out.z = pos_in.z * negate
            break;
        case 22:
            negate = -1
        case 18:
            pos_out.x = -pos_in.x
            pos_out.y = -pos_in.y
            pos_out.z = pos_in.z * negate
            break;
        case 23:
            negate = -1
        case 19:
            pos_out.x = -pos_in.y
            pos_out.y = pos_in.x
            pos_out.z = pos_in.z * negate
            break;
    }

}

let position_variant_indexes =
    [[0, 1, 2],
        [0, 2, 1],
        [1, 0, 2],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0]]

function setPositionVariant(pos_in, pos_out, rot) {
    /*
    'xyz'
    'xzy'
    'yxz'
    'yzx'
    'zxy'
    'zyx'
    */
    let index_name = ["x", "y", "z"]
    pos_out.x = pos_in[index_name[position_variant_indexes[rot][0]]]
    pos_out.y = pos_in[index_name[position_variant_indexes[rot][1]]]
    pos_out.z = pos_in[index_name[position_variant_indexes[rot][2]]]
}

let to_negate_indexes =
    [[0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1]]

function setPositionSignVariant(pos, rot) {
    /*
    '1 1 1'
    '1 1 -1'
    'yxz'
    'yzx'
    'zxy'
    'zyx'
    */
    pos.x *= to_negate_indexes[rot][0] == 1 ? -1 : 1
    pos.y *= to_negate_indexes[rot][1] == 1 ? -1 : 1
    pos.z *= to_negate_indexes[rot][2] == 1 ? -1 : 1
}

function setBeaconsCoordinatesVariant(input, output, rot) {
    _.each(input, (pos, index) => setPositionVariant(pos, output[index], rot))
}

function setBeaconsCoordinatesSignVariant(output, rot) {
    _.each(output, (pos) => setPositionSignVariant(pos, rot))
}

class ArrayValueMap extends Map {
    constructor() {
        super();
    }

    get(key) {
        if (this.has(key)) {              // If the key is already in the map
            return super.get(key);        // return its value from superclass.
        }
    }

    addToKey(key, value) {
        if (super.has(key)) {
            let prevValue = super.get(key)
            prevValue.add(value)
            super.set(key, prevValue)
        }
        else {
            let s = new Set()
            s.add(value)
            super.set(key, s)
        }
    }
}

function findBeaconsUnion(input, scanner_index_1, scanner_index_2, known_scanners, known_beacons) {
    let beacons_copy = input[scanner_index_2].map(({...ele}) => {return ele})

    let highest_find = -1
    let highest_find_beacons_copy = []
    let highest_find_beacons = []
    let highest_find_vec = null
    let highest_find_count = 0

    for (let rot1 = 0; rot1 < position_variant_indexes.length; ++rot1) {
        for (let rot2 = 0; rot2 < to_negate_indexes.length; ++rot2) {
            setBeaconsCoordinatesVariant(input[scanner_index_2], beacons_copy, rot1)
            setBeaconsCoordinatesSignVariant(beacons_copy, rot2)

            let off_map = new ArrayValueMap();

            for (let b1 = 0; b1 < input[scanner_index_1].length; ++b1) {
                for (let b2 = 0; b2 < beacons_copy.length; ++b2) {

                    let scanner_1 = _.find(known_scanners, (obj) => obj.id === scanner_index_1)
                    let pos_1 = {...input[scanner_index_1][b1]}
                    setPositionVariant(input[scanner_index_1][b1], pos_1, scanner_1.rot.at(-1))
                    setPositionSignVariant(pos_1, scanner_1.rot_negate.at(-1))
                    //scanner_1.rot.forEach((index) => setPositionRotation(pos_1, index))
                    //scanner_1.rot_negate.forEach((index) => setPositionSignVariant(pos_1, index))

                    let v12_x = (pos_1.x - beacons_copy[b2].x)
                    let v12_y = (pos_1.y - beacons_copy[b2].y)
                    let v12_z = (pos_1.z - beacons_copy[b2].z)
                    let vec = {
                        x: v12_x,
                        y: v12_y,
                        z: v12_z
                    }
                    //let dist = distance(beacons_copy[b2], input[scanner_index_1][b1])
                    //vec.x /= dist
                    //vec.y /= dist
                    //vec.z /= dist

                    /*
                    let test_x = beacons_copy[b2].x
                    let test_y = beacons_copy[b2].y
                    let test_z = beacons_copy[b2].z
                    if (scanner_index_1 === 1 && scanner_index_2 === 4) {
                        let arr = []
                        arr.push(Math.abs(test_x))
                        arr.push(Math.abs(test_y))
                        arr.push(Math.abs(test_z))
                        const corr_x = 459 - (-20)
                        const corr_y = -707 - (-1133)
                        const corr_z = 401 - (1061)

                        if (test_x === corr_x && test_y === corr_y && test_z === corr_z ||
                            _.find(arr, Math.abs(corr_x))// || _.find(arr, Math.abs(corr_y)) || _.find(arr, Math.abs(corr_z))
                        ) {
                            console.log("")
                        }
                    }
                    */

                    //off_map.forEach((value, key, obj) => {
                    //    if (key.x == vec.x && key.y == vec.y && key.z == vec.z) {
                    //        console.log("key")
                    //    }
                    //})

                    let key_str = JSON.stringify(vec)

                    off_map.addToKey(key_str, JSON.stringify({
                        "b1": input[scanner_index_1][b1],
                        "b1_index": b1,
                        "b2": beacons_copy[b2],
                        "b2_index": b2,
                        "b2_org": input[scanner_index_2][b2]
                    }
                    ))
                    //off_map.addToKey(key_str, JSON.stringify({b1: input[scanner_index_1][b1], b2: input[scanner_index_2][b2]}))
                }
            }

            //console.log("")

            let it = off_map.keys()
            while (true) {
                let next = it.next()
                if (!next || !next.value)
                    break
                let values = off_map.get(next.value)
                if (values.size >= 12 /*&& values.size > highest_find*/) {

                    let vec = JSON.parse(next.value)

                    if (scanner_index_1 == 4 && scanner_index_2 == 2) {
                        //console.log("")
                    }

                    let scanner_1 = _.find(known_scanners, (obj) => obj.id === scanner_index_1)
                    //scanner_1.rot_negate.forEach((index) => setPositionSignVariant(vec, index))
                    let vec_total = {...vec}
                    vec_total.x += scanner_1.vec.x
                    vec_total.y += scanner_1.vec.y
                    vec_total.z += scanner_1.vec.z

                    let real_new_found = 0
                    values.forEach((pos_str) => {
                        let pos = JSON.parse(pos_str)
                        //scanner_1.rot_negate.forEach((index) => setPositionSignVariant(pos.b2, index))
                        pos.b2.x += vec_total.x
                        pos.b2.y += vec_total.y
                        pos.b2.z += vec_total.z
                        let b1_pos_str = JSON.stringify(pos.b1)
                        let b2_pos_str = JSON.stringify(pos.b2)
                        if (_.find(known_beacons, (s) => s === b2_pos_str) === undefined) {
                            real_new_found++
                        }
                    })

                    //if (real_new_found >= 12)
                    {
                        highest_find_vec = vec_total
                        highest_find = real_new_found
                        highest_find_count++

                        //console.log(`For: ${scanner_index_1} with ${scanner_index_2} real_new_found:${real_new_found} highest_find:${highest_find} highest_find_count:${highest_find_count} rot1:${rot1} rot2:${rot2} vec: x=${vec_total.x},y=${vec_total.y},z=${vec_total.z}`)

                        let scanner = _.find(known_scanners, (obj) => obj.id === scanner_index_2)
                        if (scanner) {
                            scanner.vec = vec_total
                            scanner.rot.push(rot1)
                            scanner.rot_negate.push(rot2)
                            scanner.vec_hist = scanner.vec_hist.concat(scanner_1.vec_hist)
                            scanner.vec_hist.push(vec)
                        }
                        else {
                            let new_scanner = {
                                "id": scanner_index_2,
                                "vec": vec_total,
                                "vec_hist": [],
                                "rot": [rot1],
                                "rot_negate": [rot2]
                            }
                            new_scanner.vec_hist = new_scanner.vec_hist.concat(scanner_1.vec_hist)
                            new_scanner.vec_hist.push(vec)
                            known_scanners.push(new_scanner)
                        }

                        highest_find_beacons_copy = [...beacons_copy]
                        //input[scanner_index_2] = beacons_copy
                        highest_find_beacons = [...values]
                    }
                }
            }
            /*
            off_map.forEach((value, key, obj) => {
                if (value.size >= 12) {
                    let index = 0
                    let vec = JSON.parse(key)
                    console.log(`For: rot: ${rot} ${scanner_index_1} with ${scanner_index_2} vec: x=${vec.x},y=${vec.y},z=${vec.z}`)
                    let res_arr = []
                    let off_set_x = value
                    value.forEach( (pos_str) => {
                        let pos = JSON.parse(pos_str)
                        //console.log(`#${index++}: b1:${pos.b1.x},${pos.b1.y},${pos.b1.z}; b2:${pos.b2.x},${pos.b2.y},${pos.b2.z}`)
                    })
                }
            })
             */

            //_.each(beacons_copy,(pos) => {
            //    pos.x -= offset.x
            //    pos.y -= offset.y
            //    pos.z -= offset.z
            //})
        }
        let nn = 0;
        nn++;
    }

    if (highest_find > 0) {
        //input[scanner_index_2] = highest_find_beacons_copy

        /*
        highest_find_beacons_copy.forEach((pos) => {

            //console.log(`#${index++}: b1:${pos.b1.x},${pos.b1.y},${pos.b1.z}; b2:${pos.b2.x},${pos.b2.y},${pos.b2.z}`)

            if (scanner_index_1 == 1 && scanner_index_2 == 4) {
                //console.log("")
                let nn = 0;
                nn++;
            }

            let scanner_1 = _.find(known_scanners, (obj) => obj.id == scanner_index_2)
            //scanner_1.rot_negate.forEach((index) => setPositionSignVariant(pos.b2, index))

            pos.x += highest_find_vec.x
            pos.y += highest_find_vec.y
            pos.z += highest_find_vec.z

            let pos_str = JSON.stringify(pos)

            if (
                _.find(known_beacons, (s) => s === pos_str) === undefined
            )
            {
                known_beacons.push(pos_str)
                console.log(`${pos.x},${pos.y},${pos.z}`)
            }
        })
*/

        highest_find_beacons.forEach((pos_str) => {
            let pos = JSON.parse(pos_str)
            //console.log(`#${index++}: b1:${pos.b1.x},${pos.b1.y},${pos.b1.z}; b2:${pos.b2.x},${pos.b2.y},${pos.b2.z}`)

            if (scanner_index_1 == 1 && scanner_index_2 == 4) {
                //console.log("")
                let nn = 0;
                nn++;
            }

            let scanner_1 = _.find(known_scanners, (obj) => obj.id == scanner_index_2)
            //scanner_1.rot_negate.forEach((index) => setPositionSignVariant(pos.b2, index))

            pos.b2.x += highest_find_vec.x
            pos.b2.y += highest_find_vec.y
            pos.b2.z += highest_find_vec.z

            //pos.b2.x += scanner_1.vec_hist.at(-1).x
            //pos.b2.y += scanner_1.vec_hist.at(-1).y
            //pos.b2.z += scanner_1.vec_hist.at(-1).z

            pos.b2_org.x += highest_find_vec.x
            pos.b2_org.y += highest_find_vec.y
            pos.b2_org.z += highest_find_vec.z

            //let b_pos_str = JSON.stringify(pos.b2)
            //if (b_pos_str in known_beacons)
            //    known_beacons[b_pos_str] += 1
            //else
            //    known_beacons[b_pos_str] = 1

            let b1_pos_str = JSON.stringify(pos.b1)
            let b2_pos_str = JSON.stringify(pos.b2)
            let b2_org_pos_str = JSON.stringify(pos.b2_org)

            if (
                _.find(known_beacons, (s) => s === b2_pos_str) === undefined
            )
            {
                known_beacons.push(b2_pos_str)
                //console.log(`${pos.b2.x},${pos.b2.y},${pos.b2.z}`)
            }
        })

        return true
    }

    //console.log(`For: ${scanner_index_1} with ${scanner_index_2} none overlapped`)

    return false
}

function calculateBeaconsCount(input) {

    // Sort each scanners beacons
    //_.each(input,(beacons, scanner_id) => {
    //    beacons.sort((pt1, pt2) => distance(pt1, pt2))
    //})
    let known_scanners = [{id:0, vec:{x:0,y:0,z:0}, vec_hist:[{x:0,y:0,z:0}], rot:[0], rot_negate:[0]}]
    let known_beacons = []
    let was_checked = []
    let were_checked_against = {}

    let scanners_count = Object.keys(input).length
    for (let n = 0; n < scanners_count; ++n) {
        if (_.find(known_scanners, (value) => {
            return value.id === n
        }) === undefined) {
            continue
        }
        if(_.find(was_checked, (id) => {
            return id === n
        }) !== undefined)
        {
            continue;
        }
        was_checked.push(n)

        let reset_scan = false
        for (let k = 0; k < scanners_count; ++k) {
           // whyyyyyyy ?!?!?
            // if (n === k)
           //     continue
            if (`${n}_${k}` in were_checked_against)
                continue;
            were_checked_against[`${n}_${k}`] = 1
            were_checked_against[`${k}_${n}`] = 1

            if (findBeaconsUnion(input, n, k, known_scanners, known_beacons)) {
                reset_scan = true

            }
        }
        if (reset_scan)
            n = -1
    }

    //console.log("res: " + known_beacons.length)
    return Object.keys(known_beacons).length
}

function run() {
    console.log("\nDay 19")

    let input = loadData('data.txt')
    let val = calculateBeaconsCount(input);
    console.log(`Part 1: ${val}`)
    assert(val === 432)

    //val = calculateBeaconsCount(input);
    //console.log(`Part 2: ${val}`)
    //assert(val === 4664)
}

module.exports = {run, loadData, parseData, calculateBeaconsCount}