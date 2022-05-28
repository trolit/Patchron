const { decode } = require('js-base64');

/**
 * @param {object} file object received via `getFile`
 *
 * @returns {object} object expanded with decoded file's content
 */
module.exports = (file) => {
    const decodedContent = decode(file.content);

    file = { ...file, decodedContent };

    return file;
};
