const path = require('path');
const fs = require("fs");
const _ = require("underscore");
const assert = require("assert");
const common = require('../common');function loadData(fileName) {
    return parseData(fs
        .readFileSync(common.buildPath(__dirname, fileName), 'utf8')
        .toString())
}

class PacketParser {
    constructor(binaryData) {
        this.binaryData = binaryData;
        this.parsed_packets = []
    }

    parse() {
        let jobs = []
        let jobs_done = []
        let job_id = 0
        let packet_id = 0
        jobs.push({
            "id": 0,
            "parent_packet_id": -1, // id of packet which created this job
            "sub_packets": 1,       // Assume its an operator packet with sub packets count, after reading
                                    //  its header this will be changed appropriately (to either proper packets count,
                                    //  or length defined operator packet).
            "j_beg": 0,
            "j_end": -1,            // The index in data at which this job finished parsing
            "id_of_sub_job": -1     // Some jobs must wait for other,
                                    //  this field holds id of other job which will contain required information
        })
        let data = this.binaryData

        while(jobs.length !== 0) {

            let current_job = jobs.pop()
            let {
                parent_packet_id:j_parent_packet_id,
                sub_packets:j_sub_packets,
                j_beg,
                j_end,
                id_of_sub_job:j_id_of_sub_job
            } = current_job

            jobs_done.push(current_job)

            // Check if this job was postponed until its sub job will complete
            if (j_id_of_sub_job !== -1) {

                // It was postponed, check its sub job for its ending index
                let sub_job = _.find(jobs_done, (obj) => obj.id === j_id_of_sub_job)
                assert(sub_job)

                // We now know when sub job ended so we use this value here. This is like going back
                // from recursive call.
                j_beg = sub_job.j_end

                if (j_sub_packets === 0) {
                    // This is a case for operator packet with sub packets count, for which all the sub packets
                    // were already processed.
                    // note: It could actually be discarded earlier by not adding it to stack, but there can be
                    //       some other operator packets depending on it so it might not be trivial.
                    current_job.j_end = j_beg
                    continue
                }

                if (j_end !== -1 && j_beg === j_end) {
                    // This is a case for operator packet with sub packets defined by length of data.
                    // If beg equals end then this means all the data were already read.
                    // note: The same note as above applies here, with some carefull coding this job could have been
                    //       discarded earlier.
                    current_job.j_end = j_beg
                    continue;
                }
            }

            while(true) {
                if (j_sub_packets !== -1) {
                    // This packet is defined by number of subpackets
                    if (j_sub_packets === 0) {
                        current_job.j_end = j_beg
                        break
                    }
                    else
                        j_sub_packets--
                }
                else if (j_end !== -1) {
                    // This packet is defined by its sub packets length
                    if (j_beg >= j_end) {
                        current_job.j_end = j_beg
                        break;
                    }
                }

                let obj = {}
                obj.parent_id = j_parent_packet_id
                obj.id = packet_id++
                obj.version = parseInt(data.substr(j_beg + 0, 3), 2)
                obj.type_id = parseInt(data.substr(j_beg + 3, 3), 2)
                obj.literal = -1
                obj.child_packets = []
                this.parsed_packets.push(obj)

                if (obj.parent_id !== -1) {
                    let parent_packet = _.find(this.parsed_packets, (p) => p.id === obj.parent_id)
                    parent_packet.child_packets.push(obj.id)
                }

                if (obj.type_id === 4) {
                    // literal packet
                    let literal_str = ""
                    let n = j_beg + 6
                    for (; n < data.length; n += 5) {
                        literal_str += data.substr(n + 1, 4)
                        if (data[n] === '0')
                            break
                    }
                    obj.literal = parseInt(literal_str, 2)
                    j_beg = n + 5
                } else {
                    // operator packet
                    let length_type_id = data.substr(j_beg + 6, 1)

                    if (length_type_id === '0') {
                        // Length type operator packet
                        let length = parseInt(data.substr(j_beg + 7, 15), 2)
                        job_id++
                        let j_beg_ex = j_beg + 7 + 15
                        let j_end_ex = j_beg + 7 + 15 + length
                        jobs.push({
                            "id": job_id,
                            "parent_packet_id": obj.id,
                            "sub_packets": -1,
                            "j_beg": j_beg_ex,
                            "j_end": j_end_ex,
                            "id_of_sub_job": -1
                        })
                        j_beg = j_end_ex
                    }
                    else {
                        // Sub packets count operator packet
                        let sub_packets = parseInt(data.substr(j_beg + 7, 11), 2)

                        // We know number of sub packets, but have no knowledge of its length.
                        // So, we will put back current job on the stack, and after it add job to
                        // process those subpackets. Once this jobs finishes, current job will be back
                        // processed and use id_of_sub_job to get the correct length.

                        let j_beg_ex = j_beg + 7 + 11
                        job_id++

                        jobs_done.pop()
                        current_job.j_beg = j_beg_ex
                        current_job.j_end = j_end
                        current_job.sub_packets = j_sub_packets
                        current_job.id_of_sub_job = job_id
                        jobs.push(current_job)

                        jobs.push({
                            "id": job_id,
                            "parent_packet_id": obj.id,
                            "sub_packets": sub_packets,
                            "j_beg": j_beg_ex,
                            "j_end": -1,
                            "id_of_sub_job": -1
                        })

                        // abort subpackets parsing, it will come back to parsing once sub packets are parsed.
                        break;
                    }
                }
            }

        }
    }
}

function parseData(data) {
    return data
        .split('')
        .map((c) => `${parseInt(c, 16).toString(2).padStart(4, '0')}`).join('')
}

function calculateSumOfVersionNumbers(binary_data) {
    let pp = new PacketParser(binary_data)
    pp.parse()
    return _.reduce(pp.parsed_packets, (acc, packet) => acc + packet.version, 0)
}

function evaluateExpressionOfMessage(binary_data) {
    let pp = new PacketParser(binary_data)
    pp.parse()

    let jobs = []
    let jobs_done = []
    jobs.push({
        p: pp.parsed_packets[0].id,
        r: 0
    })
    while (jobs.length !== 0) {
        let job = jobs.pop()
        let packet = _.find(pp.parsed_packets, (p) => job.p === p.id)
        assert(packet)

        // Check if all results are ready, if not then push on stack required packets.
        let all_results_ready = true
        _.each(packet.child_packets, (cp) => {
            let job_result = _.find(jobs_done, (pd) => pd.p === cp)
            if (!job_result) {
                if (all_results_ready) {
                    all_results_ready = false
                    // put back on stack current packet
                    jobs.push(job)
                }
                jobs.push({
                    p: cp,
                    r: 0
                })
            }
        })
        if (!all_results_ready)
            continue

        /*
Packets with type ID 0 are sum packets - their value is the sum of the values of their sub-packets. If they only have a single sub-packet, their value is the value of the sub-packet.
Packets with type ID 1 are product packets - their value is the result of multiplying together the values of their sub-packets. If they only have a single sub-packet, their value is the value of the sub-packet.
Packets with type ID 2 are minimum packets - their value is the minimum of the values of their sub-packets.
Packets with type ID 3 are maximum packets - their value is the maximum of the values of their sub-packets.
Packets with type ID 5 are greater than packets - their value is 1 if the value of the first sub-packet is greater than the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
Packets with type ID 6 are less than packets - their value is 1 if the value of the first sub-packet is less than the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
Packets with type ID 7 are equal to packets - their value is 1 if the value of the first sub-packet is equal to the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
    */

        switch (packet.type_id) {
            case 0: //sum
                job.r = 0
                break
            case 1: //mul
                job.r = 1
                break
            case 2: //min
                job.r = Number.MAX_SAFE_INTEGER
                break
            case 3: /*max*/
                job.r = -Number.MAX_SAFE_INTEGER
                break;
            case 4: /*literal*/
                job.r = packet.literal
                break
        }

        let tmp_result;
        _.each(packet.child_packets, (cp, index) => {
            let job_result = _.find(jobs_done, (pd) => pd.p === cp)
            assert(job_result)

            switch (packet.type_id) {
                case 0: // sum
                    job.r += job_result.r
                    break
                case 1: // mul
                    job.r *= job_result.r
                    break
                case 2: // min
                    job.r = Math.min(job_result.r, job.r)
                    break
                case 3: // max
                    job.r = Math.max(job_result.r, job.r)
                    break;
                case 5: // greater
                    if (index === 0)
                        tmp_result = job_result.r
                    else if (index === 1)
                        job.r = (tmp_result > job_result.r) ? 1 : 0
                    else
                        assert(false)
                    break
                case 6: // less
                    if (index === 0)
                        tmp_result = job_result.r
                    else if (index === 1)
                        job.r = (tmp_result < job_result.r) ? 1 : 0
                    else
                        assert(false)
                    break;
                case 7: // equal
                    if (index === 0)
                        tmp_result = job_result.r
                    else if (index === 1)
                        job.r = (tmp_result === job_result.r) ? 1 : 0
                    else
                        assert(false)
            }
        })
        jobs_done.push(job)
    }

    return _.find(jobs_done, (jd) => jd.p === pp.parsed_packets[0].id).r
}

function run() {
    console.log("\nDay 16")

    let input = loadData('data.txt')
    let val = calculateSumOfVersionNumbers(input);
    console.log(`Part 1: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "1"))

    input = loadData('data.txt', true)
    val = evaluateExpressionOfMessage(input);
    console.log(`Part 2: ${val}`)
    assert(val === common.getResultIntFromFile(__dirname, "2"))
}

module.exports = { run, loadData, parseData, calculateSumOfVersionNumbers, evaluateExpressionOfMessage}