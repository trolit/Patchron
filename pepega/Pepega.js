const Review = require('./core/ReviewLoader');

class Pepega {
    /**
     * Investigates file against selected rules.
     * @param {object} file object received via **listFiles** with merged repo details
     * @return {Array<string>}  comments related to the reviewed file
     */
    static investigate(file) {
        if (!file) {
            probotInstance.log.warn(
                `Review skipped (no file found or it's content is empty) -> ${__filename}`
            );

            return null;
        }

        return new Review(file);
    }
}

module.exports = Pepega;
