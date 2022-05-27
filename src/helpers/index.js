const loopTimer = require('./loopTimer');
const getPosition = require('./getPosition');
const decodeContent = require('./decodeContent');
const getLineNumber = require('./getLineNumber');
const getContentNesting = require('./getContentNesting');
const removeWhitespaces = require('./removeWhitespaces');
const getPartOfTheContent = require('./getPartOfTheContent');
const getNearestHunkHeader = require('./getNearestHunkHeader');

module.exports = {
    loopTimer,
    getPosition,
    decodeContent,
    getLineNumber,
    getContentNesting,
    removeWhitespaces,
    getPartOfTheContent,
    getNearestHunkHeader
};
