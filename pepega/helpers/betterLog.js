/* eslint-disable no-console */
// https://stackoverflow.com/a/41407246

const textColors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

const terminalColorReset = '\x1b[0m';

module.exports = (text, color) => {
    console.log(`${textColors[color]}%s${terminalColorReset}`, text);
};
