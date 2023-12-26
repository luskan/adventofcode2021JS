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
    //Player 1 starting position: 10
    //Player 2 starting position: 6
    let players = []
    data.forEach((line) => {
        const player = /Player (?<player_id>\d+) starting position: (?<starting_position>\d+)/.exec(line).groups
      players.push({
          player_id: parseInt(player.player_id, 10),
          position: parseInt(player.starting_position, 10),
          score: 0
      })
    })
    return players
}

function calculateGameResultForPart1(data) {
    let d = 1
    let result = 0
    while (true) {
        for (let player of data) {
          let d1 = d++;
          let d2 = d++;
          let d3 = d++;
          player.position = (player.position - 1 + d1 + d2 + d3) % 10 + 1
          player.score += player.position;
          if (player.score >= 1000) {
              d--
              break
          }
        }
        const bestPlayer = _.max(data, (p) => p.score)
        if (bestPlayer.score >= 1000) {
            const otherPlayer = _.filter(data, (p) => {
                return p.player_id !== bestPlayer.player_id
            })
            result = otherPlayer[0].score * d
            break;
        }
    }

    return result
}

//tbd: optimize, some of the entries sums repeats, so their computation can be multiplied by its frequencies.
let dice3_product = [[1,1,1],
    [1,1,2],
    [1,1,3],
    [1,2,1],
    [1,2,2],
    [1,2,3],
    [1,3,1],
    [1,3,2],
    [1,3,3],
    [2,1,1],
    [2,1,2],
    [2,1,3],
    [2,2,1],
    [2,2,2],
    [2,2,3],
    [2,3,1],
    [2,3,2],
    [2,3,3],
    [3,1,1],
    [3,1,2],
    [3,1,3],
    [3,2,1],
    [3,2,2],
    [3,2,3],
    [3,3,1],
    [3,3,2],
    [3,3,3]]

function calculateNumberOfTurnsPart2(position1, position2, score1, score2, cache) {
    let stack = []

    stack.push({
        p1: position1,
        p2: position2,
        s1: score1,
        s2: score2,
        wins1: 0,
        wins2: 0,
        k: 0
    })

    while (stack.length !== 0) {
        let g = stack.pop()

        if ('next_turn' in g) {
            let nt = cache[g.next_turn]
            g.wins1 += nt[1]
            g.wins2 += nt[0]
        }

        let descent = false
        for(; g.k < dice3_product.length; ++g.k) {
            let n = dice3_product[g.k]
                let new_pos1 = (g.p1 - 1 + (n[0] + n[1] + n[2])) % 10 + 1
                let news_core1 = g.s1 + new_pos1;
                if (news_core1 >= 21) {
                    g.wins1++
                } else {
                    let ck = `${g.p2}_${new_pos1}_${g.s2}_${news_core1}`
                    if (ck in cache) {
                        g.wins1 += cache[ck][1]
                        g.wins2 += cache[ck][0]
                    }
                    else {
                        let next_turn = {
                            'p1': g.p2,
                            'p2': new_pos1,
                            's1': g.s2,
                            's2': news_core1,
                            'wins1': 0,
                            'wins2': 0,
                            'k': 0
                        }
                        g['next_turn'] = ck
                        g.k++
                        stack.push(g)
                        stack.push(next_turn)
                        descent = true
                        break
                    }
                }
            }
        if (descent)
            continue
        let ck = `${g.p1}_${g.p2}_${g.s1}_${g.s2}`
        assert(!(ck in cache))
        cache[ck] = [g.wins1, g.wins2]
    }
    return cache[`${position1}_${position2}_${score1}_${score2}`]
}

function calculateGameResultForPart2(data) {
    let results = calculateNumberOfTurnsPart2(data[0].position, data[1].position, 0, 0, {})
    return Math.max(results[0], results[1])
}

function run() {
    console.log("\nDay 21")
    let input = loadData('data.txt')
    let res = calculateGameResultForPart1(input);
    console.log(`Part 1: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "1"))

    // input = loadData('data.txt')
    res = calculateGameResultForPart2(input);
    console.log(`Part 2: ${res}`)
    assert(res === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = {run, loadData, parseData, calculateGameResultForPart1, calculateGameResultForPart2}