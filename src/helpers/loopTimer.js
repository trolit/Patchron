/**
 * slows loop execution to avoid GitHub API overloading while adding review comments
 *
 * @param {number} milliseconds
 *
 * {@link https://stackoverflow.com/a/44476626}
 */
module.exports = (milliseconds) => {
    return new Promise((result) => setTimeout(result, milliseconds));
};
