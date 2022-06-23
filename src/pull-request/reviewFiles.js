const reviewFile = require('./reviewFile');
const getFiles = require('src/github/getFiles');

/**
 * triggers `Pepega.js` to review files against configured rules
 *
 * @param {PatchronContext} patchronContext
 *
 * @returns {Array<object>} review comments
 */
module.exports = async (patchronContext) => {
    const reviewComments = [];

    try {
        const files = await getFiles(patchronContext);
        const filesLength = files.length;

        for (let i = 0; i < filesLength; i++) {
            const file = {
                ...files[i],
                extension: files[i].filename.split('.').pop()
            };

            const comments = reviewFile(patchronContext, file);

            reviewComments.push(...comments);
        }
    } catch (error) {
        patchronContext.log.error(error);
    }

    return reviewComments;
};
