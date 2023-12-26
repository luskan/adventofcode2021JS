const assert = require("assert");
const fs = require("fs");
const path = require("path");
const common = require('../common');

function loadData(fileName, part2) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .split('\n'), part2)
    //.map((line) => line.split('')))
}

function parseData(data, part2) {
    /*
    #############
    #...........#
    ###C#C#B#D###
      #D#A#B#A#
      #########
     */

    if (part2) {
        let ln1 = "  #D#C#B#A#"
        let ln2 = "  #D#B#A#C#"
        data.splice(3, 0, ln1)
        data.splice(4, 0, ln2)
    }

    const hallway = /#(?<dots>\.+)#/.exec(data[1]).groups
    const rooms_parse = /#+(?<room1>\w+)#(?<room2>\w+)#(?<room3>\w+)#(?<room4>\w+)#+/
    let parsed_data = {
        hallway: hallway.dots.split(''),
        rooms: [],
        least_energy: Number.MAX_SAFE_INTEGER
    }

    for (let row = 2; row < data.length - 1; ++row) {
        const rooms = rooms_parse.exec(data[row]).groups
        parsed_data.rooms.push([rooms.room1[0], rooms.room2[0], rooms.room3[0], rooms.room4[0]])
    }

    parsed_data['amphis'] = []
    for (let row = 0; row < parsed_data.rooms.length; ++row) {
        for (let room = 0; room <= 3; ++room) {
            parsed_data['amphis'].push(
                {
                    name: parsed_data.rooms[row][room],
                    room: room,
                    row: row,
                    hallway_pos: -1,
                    has_moved: false
                }
            )
        }
    }


    return parsed_data
}

function amphipodeEnergyByName(name) {
    switch (name) {
        case 'A':
            return 1
        case 'B':
            return 10
        case 'C':
            return 100
        case 'D':
            return 1000
    }
    assert(false)
}

function drawRooms(data) {
    console.log(`############# - ${least_energy}`)
    console.log(`#${data.hallway.join('')}#`)
    for (let n = 0; n < data.rooms.length; ++n) {
        console.log(`${n === 0 ? "###" : "  #"}${data.rooms[n][0]}#${data.rooms[n][1]}#${data.rooms[n][2]}#${data.rooms[n][3]}${n === 0 ? "###" : "#"}`)
    }
    console.log("  #########")
    console.log("")
}

const hallway_exit_ind = [2, 4, 6, 8]
const allowed_stay_ind = [0, 1, 3, 5, 7, 9, 10]

function amphiToNum(c) {
    if (c === 'A')
        return 1
    else if (c === 'B')
        return 2
    else if (c === 'C')
        return 3
    else if (c === 'D')
        return 4
    else
        return 5 // for '.'
}

function amphiDataToKey(org_data, prev_energy) {
    let key1 = 0
    for (let n = 0; n < org_data.hallway.length; ++n) {
        key1 *= 10
        key1 += amphiToNum(org_data.hallway[n])
    }
    let key2 = 0
    for (let n = 0; n < org_data.rooms.length; ++n) {
        for (let r = 0; r < org_data.rooms[n].length; ++r) {
            key2 *= 10
            key2 += amphiToNum(org_data.rooms[n][r].charAt(0))
        }
    }

    // I am not sure this blocks some execution paths, algorithm passes all the tests.
    // More reliable but slower would be string key. Even better solution for good key would be bit packing
    // of the data state.
    return key1 ^ key2 ^ prev_energy
}

function findLeastEnergyRec(org_data, prev_energy, cache) {
    let key = amphiDataToKey(org_data, prev_energy)
    if (cache.has(key))
        return
    cache.set(key, 1)

    for (let n = 0; n < org_data.amphis.length; ++n) {
        let amp = org_data.amphis[n]

        // Check if it is in its final position
        if (amp.has_moved && amp.hallway_pos === -1)
            continue

        let row = amp.row
        let room = amp.room

        if (row >= 0) {
            // if row is non -1 then amphi is not on hallway but in some room. Check if it is exit is blocked by other
            // amphis.
            let found_non_dot = false
            for (let n = 0; n < row && n < org_data.rooms.length; ++n) {
                if (org_data.rooms[n][room] !== '.') {
                    found_non_dot = true
                    break;
                }
            }
            if (found_non_dot)
                continue
        }

        let home_room = 0
        if (amp.name === 'A')
            home_room = 0
        else if (amp.name === 'B')
            home_room = 1
        else if (amp.name === 'C')
            home_room = 2
        else if (amp.name === 'D')
            home_room = 3

        // Check if it is in its destination place (ie. it was there from the beggining).
        // Also check if its in home room, it isn't blocking some other amphi below it. If so, then even
        // tho it is in destination room, it will have to move to hallway to allow those amphis move out.
        if (home_room === room) {
            let is_blocking_other_amphis = false
            for (let n = row + 1; n < org_data.rooms.length; ++n) {
                if (org_data.rooms[n][room] !== '.' && org_data.rooms[n][room] !== amp.name) {
                    is_blocking_other_amphis = true
                    break;
                }
            }
            if (!is_blocking_other_amphis)
                continue
        }

        // Now process separately amphis on hallway and those still in room
        if (amp.hallway_pos !== -1) {

            // Amphi is on hallway

            // Try to go home. Find a position in the room most to the bottom, also verify if entering it
            // will not block other amphis.
            let home_room_exit_pos = hallway_exit_ind[home_room]
            let is_home_free = false
            let home_row = 0

            // First find first empty place in this room
            for (let n = 0; n < org_data.rooms.length; ++n) {
                if (org_data.rooms[n][home_room] === '.') {
                    home_row = n
                    is_home_free = true
                } else
                    break;
            }
            // Now check if below this place, there are only taken places by its own kind.
            for (let n = home_row + 1; n < org_data.rooms.length; ++n) {
                if (org_data.rooms[n][home_room] !== amp.name) {
                    is_home_free = false
                    break;
                }
            }
            if (!is_home_free)
                continue

            // Check if hallway movement is blocked by some other amphi
            let is_blocked = false
            if (home_room_exit_pos < amp.hallway_pos) {
                for (let k = home_room_exit_pos; k < amp.hallway_pos && !is_blocked; ++k) {
                    if (org_data.hallway[k] !== '.')
                        is_blocked = true
                }
            } else {
                for (let k = amp.hallway_pos + 1; k <= home_room_exit_pos && !is_blocked; ++k) {
                    if (org_data.hallway[k] !== '.')
                        is_blocked = true
                }
            }

            if (is_home_free && !is_blocked) {
                // Movement is allowed

                let energy = (Math.abs(home_room_exit_pos - amp.hallway_pos) + (home_row + 1)) * amphipodeEnergyByName(amp.name)
                if (prev_energy + energy >= org_data.least_energy)
                    continue

                // Check if all amphis are in their home places. If so, then this is a final step.
                let all_amphis_are_home = true;
                let prev_room_owner = org_data.rooms[home_row][home_room]
                org_data.rooms[home_row][home_room] = amp.name
                for (let r = 0; r < org_data.rooms.length; ++r) {
                    if (!(org_data.rooms[r][0] === 'A' && org_data.rooms[r][1] === 'B' && org_data.rooms[r][2] === 'C' && org_data.rooms[r][3] === 'D')) {
                        all_amphis_are_home = false
                        break;
                    }
                }
                org_data.rooms[home_row][home_room] = prev_room_owner

                if (all_amphis_are_home) {
                    // All are home, update least energy variable
                    org_data.least_energy = energy + prev_energy
                } else {
                    let prev_hallway_amphi = org_data.hallway[amp.hallway_pos]
                    let prev_room_amphi = org_data.rooms[home_row][home_room]
                    let prev_row = amp.row
                    let prev_room = amp.room
                    let prev_hallway_pos = amp.hallway_pos

                    org_data.hallway[amp.hallway_pos] = '.'
                    org_data.rooms[home_row][home_room] = amp.name
                    amp.row = home_row
                    amp.room = home_room
                    amp.hallway_pos = -1

                    findLeastEnergyRec(org_data, prev_energy + energy, cache)

                    org_data.hallway[prev_hallway_pos] = prev_hallway_amphi
                    org_data.rooms[home_row][home_room] = prev_room_amphi
                    amp.row = prev_row
                    amp.room = prev_room
                    amp.hallway_pos = prev_hallway_pos
                }
            }
        } else {
            // Its in some room

            // Lets try all hallways positions
            for (let i = 0; i < allowed_stay_ind.length; ++i) {
                if (org_data.hallway[allowed_stay_ind[i]] !== '.')
                    continue

                // Check if it is blocked by some other amphi
                let is_blocked_by_amphis_above = false
                for (let n = row - 1; n >= 0; --n) {
                    if (org_data.rooms[n][room] !== '.') {
                        is_blocked_by_amphis_above = true
                        break;
                    }
                }
                if (is_blocked_by_amphis_above)
                    continue

                let energy = 0
                let new_pos = -1

                // Get new hallway position
                new_pos = allowed_stay_ind[i]

                // Check if getting to it is possible
                let exit_pos = hallway_exit_ind[room]
                let is_blocked = false
                if (new_pos < exit_pos) {
                    for (let k = new_pos; k < exit_pos && !is_blocked; ++k) {
                        if (org_data.hallway[k] !== '.')
                            is_blocked = true
                    }
                } else {
                    for (let k = exit_pos + 1; k <= new_pos && !is_blocked; ++k) {
                        if (org_data.hallway[k] !== '.')
                            is_blocked = true
                    }
                }
                if (is_blocked)
                    continue

                let name = org_data.rooms[row][room];
                assert(name !== '.')
                energy += (Math.abs(exit_pos - new_pos) + (row + 1)) * amphipodeEnergyByName(name)

                if (prev_energy + energy < org_data.least_energy) {
                    let prev_room_amphi = org_data.rooms[row][room]
                    let prev_hallway_amphi = org_data.hallway[new_pos]
                    let prev_hallway_pos = amp.hallway_pos
                    let prev_row = amp.row
                    let prev_room = amp.room
                    let prev_has_moved = amp.has_moved

                    org_data.rooms[row][room] = '.';
                    org_data.hallway[new_pos] = name;
                    amp.hallway_pos = new_pos
                    amp.row = -1
                    amp.room = -1
                    amp.has_moved = true

                    findLeastEnergyRec(org_data, prev_energy + energy, cache)

                    org_data.rooms[row][room] = prev_room_amphi
                    org_data.hallway[new_pos] = prev_hallway_amphi
                    amp.hallway_pos = prev_hallway_pos
                    amp.row = prev_row
                    amp.room = prev_room
                    amp.has_moved = prev_has_moved
                }
            }
        }
    }
}

function calculateLeastEnergy(data) {
    const was_checked = new Map()

    //console.time("findLeastEnergyRec")
    findLeastEnergyRec(data, 0, was_checked)
    //console.timeEnd("findLeastEnergyRec")

    return data.least_energy
}

function run() {
    console.log("\nDay 23")

    let input = loadData('data.txt', false)
    let res = calculateLeastEnergy(input, true);
    console.log(`Part 1: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "1"))

    let input2 = loadData('data.txt', true)
    res = calculateLeastEnergy(input2, false);
    console.log(`Part 2: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateLeastEnergy}