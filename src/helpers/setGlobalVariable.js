/**
 * @param {string} property - global variable property name
 * @param {any} value
 */
module.exports = (property, value) => {
    global[property] = value;
};
