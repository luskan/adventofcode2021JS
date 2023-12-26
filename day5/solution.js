const path = require('path');
const fs = require("fs");
const _ = require("underscore")
const assert = require("assert");
const common = require('../common');class Line {
    constructor(x0, y0, x1, y1) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
    }

    isHorizontalOrVertical() {
        return this.x0 === this.x1 || this.y0 === this.y1;
    }

    // Bresenham algorithm, ... actually its not needed as lines are at most 45 degrees
    line() {
        let x0 = this.x0;
        let y0 = this.y0;
        let x1 = this.x1;
        let y1 = this.y1;

        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let points = []

        while(true) {
            points.push([x0, y0]);

            if ((x0 === x1) && (y0 === y1)) break;
            let e2 = 2*err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }

        return points;
    }
}

function loadData(fileName) {
    // parse lines of data in a form: 0,9 -> 5,9
    rg = /(\d+),(\d+) -> (\d+),(\d+)/
    return fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString()
        .trim()
        .split('\n')
        .map((line) => {
            let [,x1,y1,x2,y2] = rg.exec(line)
            return new Line(parseInt(x1), parseInt(y1), parseInt(x2), parseInt(y2));
        })
}

function calculateOverlappingPoints(input, part2) {
    let ptsMap = _.reduce(input, (points, line) => {
        if (part2 || line.isHorizontalOrVertical()) {
            line.line().forEach((pt) => {
                if (pt in points)
                    points[pt]++
                else
                    points[pt] = 1
            });
        }
        return points;
    }, {})
    return _.reduce(ptsMap, (sum, value) => {
            return sum + (value >= 2 ? 1 : 0)
        }, 0)
}

function run() {
    input = loadData('data.txt')

    console.log("\nDay 5")

    let val = calculateOverlappingPoints(input, false);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    val = calculateOverlappingPoints(input, true);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, calculateOverlappingPoints}