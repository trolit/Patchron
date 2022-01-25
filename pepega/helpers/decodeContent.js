const { decode } = require('js-base64');

/**
 * @returns {object} object expanded with decoded file's content received via getFile request
 */
module.exports = (file) => {
    const decoded_content = decode(file.content);

    file = { ...file, decoded_content };

    return file;
};
