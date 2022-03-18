const _ = require("lodash");
const assert = require("assert");
const fs = require("fs");
const path = require("path");

function loadData(fileName) {
    return parseData(fs
        .readFileSync(path.join(__dirname, fileName), "utf-8")
        .toString()
        .split('\n'))
    //.map((line) => line.split('')))
}

function parseData(data) {
    /*
    #############
    #...........#
    ###C#C#B#D###
      #D#A#B#A#
      #########
     */

    const hallway = /#(?<dots>\.+)#/.exec(data[1]).groups
    const rooms_parse = /#+(?<room1>\w+)#(?<room2>\w+)#(?<room3>\w+)#(?<room4>\w+)#+/
    const top_rooms = rooms_parse.exec(data[2]).groups
    const bottom_rooms = rooms_parse.exec(data[3]).groups
    let parsed_data = {
        hallway: hallway.dots.split(''),
        rooms: [
            [top_rooms.room1[0], top_rooms.room2[0], top_rooms.room3[0], top_rooms.room4[0]],
            [bottom_rooms.room1[0], bottom_rooms.room2[0], bottom_rooms.room3[0], bottom_rooms.room4[0]]
        ],
    }

    parsed_data['amphis'] = []
    for (let row = 0; row <= 1; ++row) {
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

let least_energy = Number.MAX_SAFE_INTEGER

function drawRooms(data) {
    console.log(`############# - ${least_energy}`)
    console.log(`#${data.hallway.join('')}#`)
    console.log(`###${data.rooms[0][0]}#${data.rooms[0][1]}#${data.rooms[0][2]}#${data.rooms[0][3]}###`)
    console.log(`  #${data.rooms[1][0]}#${data.rooms[1][1]}#${data.rooms[1][2]}#${data.rooms[1][3]}#`)
    console.log("  #########")
    console.log("")
}

let was_checked = {}


let hallway_exit_ind = [2, 4, 6, 8]
let allowed_stay_ind = [0, 1, 3, 5, 7, 9, 10]

function findLeastEnergyRec(org_data, prev_energy, depth) {
    if (prev_energy > least_energy)
        return

    let key = `${prev_energy}_${org_data.hallway.join('')}_${org_data.rooms[0][0]}#${org_data.rooms[0][1]}#${org_data.rooms[0][2]}#${org_data.rooms[0][3]}#${org_data.rooms[1][0]}#${org_data.rooms[1][1]}#${org_data.rooms[1][2]}#${org_data.rooms[1][3]}`
    if (key in was_checked) {
        return
    }
    was_checked[key] = 1

    //drawRooms(data)
    /*
let dgb = false
    if (   org_data.hallway.join('') === "...B.C....." &&
           org_data.rooms[0][0] === 'B' && org_data.rooms[0][1] === '.' && org_data.rooms[0][2] === '.' && org_data.rooms[0][3] === 'D'
        && org_data.rooms[1][0] === 'A' && org_data.rooms[1][1] === 'D' && org_data.rooms[1][2] === 'C' && org_data.rooms[1][3] === 'A'
    ) {
        if (prev_energy == 240)
            dgb = true
        console.log(`prev_energy - ${prev_energy}`)
        drawRooms(org_data)
    }
    if (   org_data.hallway.join('') === "...B......." &&
           org_data.rooms[0][0] === 'B' && org_data.rooms[0][1] === '.' && org_data.rooms[0][2] === 'C' && org_data.rooms[0][3] === 'D'
        && org_data.rooms[1][0] === 'A' && org_data.rooms[1][1] === 'D' && org_data.rooms[1][2] === 'C' && org_data.rooms[1][3] === 'A'
    ) {
        console.log(`prev_energy - ${prev_energy}`)
        drawRooms(org_data)
    }
     */

    for (let n = 0; n < org_data.amphis.length; ++n) {
        if (org_data.amphis[n].has_moved && org_data.amphis[n].hallway_pos === -1)
            continue

        let amp = org_data.amphis[n]
        let row = amp.row
        let room = amp.room

        if (row === 1 && org_data.rooms[0][room] !== '.')
            continue

        //if (dgb && amp.name === 'C') {
        //    console.log("")
        //}

        let home_room = 0
        if (amp.name === 'A')
            home_room = 0
        else if (amp.name === 'B')
            home_room = 1
        else if (amp.name === 'C')
            home_room = 2
        else if (amp.name === 'D')
            home_room = 3

        // Check if it is in its destination place. Also check if its in home room, it isn't blocking some other amphi.
        if (home_room === room) {
            if (row === 1)
                continue;
            if (row === 0) {
                if (org_data.rooms[1][home_room] === amp.name) {
                    continue
                }
            }
        }

        // If row is -1 then it indicates amphi is on hallway
        if (row === -1) {
            //drawRooms(data)


            // Try to go home
            let home_room_exit_pos = hallway_exit_ind[home_room]
            let is_home_free = false
            let home_row = 0
            if (org_data.rooms[1][home_room] === '.') {
                is_home_free = true
                home_row = 1
            } else if (org_data.rooms[0][home_room] === '.') {
                is_home_free = true
                home_row = 0
            }
            if (home_row === 0 && org_data.rooms[1][home_room] !== amp.name) {
                // its neighbours from bottom place is different
                is_home_free = false
            }
            if (!is_home_free)
                continue

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
                let data = _.cloneDeep(org_data)
                let amp = data.amphis[n]
                data.hallway[amp.hallway_pos] = '.'
                data.rooms[home_row][home_room] = amp.name
                amp.row = home_row
                amp.room = home_room
                let energy = (Math.abs(home_room_exit_pos - amp.hallway_pos) + (home_row === 1 ? 2 : 1)) * amphipodeEnergyByName(amp.name)
                amp.hallway_pos = -1

                //drawRooms(data)

                // Check if all amphis are in their home places.
                if (data.rooms[0][0] === 'A' && data.rooms[0][1] === 'B' && data.rooms[0][2] === 'C' && data.rooms[0][3] === 'D'
                    && data.rooms[1][0] === 'A' && data.rooms[1][1] === 'B' && data.rooms[1][2] === 'C' && data.rooms[1][3] === 'D') {

                    if (prev_energy+energy < least_energy) {
                        least_energy = energy + prev_energy
                        drawRooms(data)
                        console.log(`depth: ${depth}`)
                    }
                } else {
                    if (prev_energy+energy < least_energy)
                        findLeastEnergyRec(data, prev_energy + energy, depth + 1)
                }
            }
        } else {
            // Its in some room
            //if (data.rooms[row][room] === '.') {
            //    assert(data.rooms[row][room] !== '.')
            //}

            // Lets try all hallways positions
            for (let i = 0; i < allowed_stay_ind.length; ++i) {
                //if (org_data.rooms[row][room] === '.')
                //    continue
                if (org_data.hallway[allowed_stay_ind[i]] !== '.')
                    continue

                // Check if it is blocked by some other amphi
                if (row === 1 && org_data.rooms[0][room] !== '.')
                    continue

                let amp = org_data.amphis[n]

                let energy = 0
                let name = org_data.rooms[row][room];
                assert (name !== '.')
                let new_pos = -1

                new_pos = allowed_stay_ind[i]

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

                let data = _.cloneDeep(org_data)
                data.rooms[row][room] = '.';
                data.hallway[new_pos] = name;
                data.amphis[n].hallway_pos = new_pos
                data.amphis[n].row = -1
                data.amphis[n].room = -1
                data.amphis[n].has_moved = true
                energy += (Math.abs(exit_pos - new_pos) + (row === 1 ? 2 : 1)) * amphipodeEnergyByName(name)

                if (prev_energy + energy < least_energy)
                    findLeastEnergyRec(data, prev_energy + energy, depth + 1)
            }
        }
    }
}

function calculateLeastEnergy(data, part1) {
    findLeastEnergyRec(data, 0, 0)
    return least_energy
}

function run() {
    console.log("\nDay 23")
    let input = loadData('data.txt')

    let res = calculateLeastEnergy(input, true);
    console.log(`Part 1: ${res}`)
    assert(res === 15299)

    //res = calculateLeastEnergy(input, false);
    //console.log(`Part 2: ${res}`)
    //assert(res === 1235484513229032)
}

module.exports = {run, loadData, parseData, calculateLeastEnergy}