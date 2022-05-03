const Review = require('./pull-request/ReviewLoader');
const { logWarning } = require('./utilities/EventLog');

class Pepega {
    /**
     * Investigates file against selected rules.
     * @param {object} file object received via **listFiles** with merged repo details
     * @return {Array<string>}  comments related to the reviewed file
     */
    static investigate(file) {
        if (!file) {
            logWarning(
                __filename,
                `Review skipped (no file found or it's content is empty)`
            );

            return null;
        }

        return new Review(file);
    }
}

module.exports = Pepega;
