const loopTimer = require('./loopTimer');
const getPosition = require('./getPosition');
const decodeContent = require('./decodeContent');
const getLineNumber = require('./getLineNumber');
const getDataStructure = require('./getDataStructure');
const removeWhitespaces = require('./removeWhitespaces');
const getNearestHunkHeader = require('./getNearestHunkHeader');

module.exports = {
    loopTimer,
    getPosition,
    decodeContent,
    getLineNumber,
    getDataStructure,
    removeWhitespaces,
    getNearestHunkHeader
};
