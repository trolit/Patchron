const reviewFile = require('./reviewFile');
const getFiles = require('../github/getFiles');

/**
 * triggers `Pepega.js` to review files against configured rules
 *
 * @param {PepegaContext} pepegaContext
 *
 * @returns {Array<object>} review comments
 */
module.exports = async (pepegaContext) => {
    const reviewComments = [];

    try {
        const files = await getFiles(pepegaContext);
        const filesLength = files.length;

        for (let i = 0; i < filesLength; i++) {
            const file = {
                ...files[i],
                extension: files[i].filename.split('.').pop()
            };

            const comments = reviewFile(pepegaContext, file);

            reviewComments.push(...comments);
        }
    } catch (error) {
        pepegaContext.log.error(error);
    }

    return reviewComments;
};
