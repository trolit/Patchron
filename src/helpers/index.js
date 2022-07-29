const loopTimer = require('./loopTimer');
const decodeContent = require('./decodeContent');
const getLineNumber = require('./getLineNumber');
const getDataStructure = require('./getDataStructure');
const removeWhitespaces = require('./removeWhitespaces');
const getNearestHunkHeader = require('./getNearestHunkHeader');
const getMultiLineStructure = require('./getMultiLineStructure');

module.exports = {
    loopTimer,
    decodeContent,
    getLineNumber,
    getDataStructure,
    removeWhitespaces,
    getNearestHunkHeader,
    getMultiLineStructure
};
