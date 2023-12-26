// common.js
const fs = require('fs');
const path = require('path');


// A sample function
function buildPath(dirname, fileName) {
    return path.join(dirname, `../../adventofcode_input/2021/${dirname.split('/').pop()}/${fileName}`)
}

function getResultIntFromFile(dirname, num) {
    return parseInt(fs
    .readFileSync(buildPath(dirname, `result${num}.txt`, 'utf8')).toString());
}

function getResultStringFromFile(dirname, num) {
    return fs
        .readFileSync(buildPath(dirname, `result${num}.txt`, 'utf8')).toString();
}

// Export them
module.exports = {
    buildPath,
    getResultIntFromFile,
    getResultStringFromFile
};
