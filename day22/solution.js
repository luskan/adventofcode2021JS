const _ = require("underscore");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const common = require('../common');


function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString().split('\n'))
}

function parseData(data) {
    // on x=-20..26,y=-36..17,z=-47..7
    // off x=-48..-32,y=26..41,z=-47..-37
    let cuboids = []
    data.forEach((line) => {
        if (line.trim().length === 0)
            return
        const cuboid = /(?<on_off>(on|off)) x=(?<x1>[-\d]+)\.\.(?<x2>[-\d]+),y=(?<y1>[-\d]+)\.\.(?<y2>[-\d]+),z=(?<z1>[-\d]+)\.\.(?<z2>[-\d]+)/
            .exec(line.trim()).groups
        cuboids.push({
            on: (cuboid.on_off === "on"),
            cube: {
                x1: parseInt(cuboid.x1, 10),
                x2: parseInt(cuboid.x2, 10),
                y1: parseInt(cuboid.y1, 10),
                y2: parseInt(cuboid.y2, 10),
                z1: parseInt(cuboid.z1, 10),
                z2: parseInt(cuboid.z2, 10)
            }
        })
    })
    return cuboids
}

function axisIntersection(a1, a2, b1, b2) {
    if (a1 < b1 && a2 < b1 || a1 > b2 && a2 > b2) // a1..a2 b1..b2     or     b1..b2 a1..a2
        return null
    if (a1 >= b1 && a2 <= b2) // b1..[a1..a2]..b2
        return [a1, a2]
    if (b1 >= a1 && b2 <= a2) // a1..[b1..b2]..a2
        return [b1, b2]
    if (a1 < b1 && a2 >= b1)  // a1..[b1..a2]..b2
        return [b1, a2]
    if (a1 <= b2 && a2 > b2)  // b1..[a1..b2]..a2
        return [a1, b2]
    if (b1 < a1 && b2 >= a1)  // b1..[a1..b2]..a2
        return [a1, b2]
    if (b1 <= a2 && b2 > a2)  // a1..[b1..a2]..b2
        return [b1, a2]
    assert(false)
    return null
}

function intersect(cube1, cube2) {
    let result = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        z1: 0,
        z2: 0
    }
    let x = axisIntersection(cube1.x1, cube1.x2, cube2.x1, cube2.x2)
    if (!x)
        return null
    let y = axisIntersection(cube1.y1, cube1.y2, cube2.y1, cube2.y2)
    if (!y)
        return null
    let z = axisIntersection(cube1.z1, cube1.z2, cube2.z1, cube2.z2)
    if (!z)
        return null
    result.x1 = x[0]
    result.x2 = x[1]
    result.y1 = y[0]
    result.y2 = y[1]
    result.z1 = z[0]
    result.z2 = z[1]
    return result
}

function calculateVolume(cube) {
    let x = Math.max(1, cube.x2 - cube.x1 + 1)
    assert(x > 0)
    let y = Math.max(1, cube.y2 - cube.y1 + 1)
    assert(y > 0)
    let z = Math.max(1, cube.z2 - cube.z1 + 1)
    assert(z > 0)
    return x * y * z
}

function calculateCubesInOnState(data, part1) {
    let core_cubes = []
    let filter_cube = {
        x1:-50,
        x2:50,
        y1:-50,
        y2:50,
        z1:-50,
        z2:50
    }
    for (let cuboid of data) {
        if (part1) {
            cuboid.cub = intersect(filter_cube, cuboid.cube)
            if (!cuboid.cub)
                continue
        }

        // https://www.reddit.com/r/adventofcode/comments/rlxhmg/2021_day_22_solutions/hqxczc4/?utm_source=share&utm_medium=web2x&context=3
        // Idea to use +1 and -1, and negating it comes from reddit on 22 days of aoc, it is from set theory:
        // (AvB)vC| = (|A|+|B|-|A^B|) + |C| - |A^C| - |A^B| + |A^B^C|
        // so initially you have only |A| (it is added to core_cubes), then in next iteration you add |B|, it is
        // added to core_cubes, but also you remove |A^B| by intersecting |B| with |A| and adding result to
        // core_cubes with negated on flag. Then when you add |C| you follow the same pattern.
        
        let new_cuboid = {
            on: (cuboid.on ? 1 : -1),
            cub: cuboid.cube
        }

        let add_cubes = []
        if (cuboid.on) {
            add_cubes.push(new_cuboid)
        }

        core_cubes.forEach((on_cuboid) => {
            let int_res = intersect(new_cuboid.cub, on_cuboid.cub)
            if (int_res) {
                add_cubes.push({
                    on: -on_cuboid.on,
                    cub: int_res
                })
            }
        })

        core_cubes.push(...add_cubes)
    }
    return _.reduce(core_cubes, (acc, c) => acc + calculateVolume(c.cub) * c.on, 0)
}

function run() {
    console.log("\nDay 22")
    let input = loadData('data.txt')

    let res = calculateCubesInOnState(input, true);
    console.log(`Part 1: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "1"))

    res = calculateCubesInOnState(input, false);
    console.log(`Part 2: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateCubesInOnState}