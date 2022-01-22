const FileLoader = require('./loaders/File');

class Pepega {
    /**
     * Investigates file against selected rules.
     * @param {object} file File from pull request.
     * @param file.name The name of the file.
     * @param file.content file content in base64 encoding.
     * @return {Array<string>}  comments related to the reviewed file
     */
    static investigate(file) {
        if (!this.file || !this.file.content) {
            probotInstance.log.warn(
                `Review skipped (no file found or it's content is empty) -> ${__filename}`
            );

            return null;
        }

        return new FileLoader(file);
    }
}

module.exports = Pepega;
