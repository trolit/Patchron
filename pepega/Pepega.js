const FileLoader = require('./loaders/File');

class Pepega {
    /**
     * @param {object} file File from pull request.
     * @param file.name The name of the file.
     * @param file.content file content in base64 encoding.
     * @return {string}  comments related to the reviewed file
     */
    static investigate(file) {
        return new FileLoader(file);
    }
}

module.exports = Pepega;
