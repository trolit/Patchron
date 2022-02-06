const Pepega = require('../Pepega');

/**
 * triggers Pepega to review files against configured rules
 * @param {object} repo basic repo data (including pull number)
 * @param {Array<object>} files pull request files
 * @param {object} rules configured rules
 * @returns {Array<object>} review comments
 */
module.exports = (repo, files, rules) => {
    let reviewComments = [];

    for (let i = 0; i < files.length; i++) {
        const file = { ...files[i], ...repo };

        const comments = Pepega.investigate(file).against(rules);

        reviewComments = [...reviewComments, ...comments];
    }

    return reviewComments;
};
