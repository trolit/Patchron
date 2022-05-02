const ReviewHandler = require('./ReviewHandler');
const { logInformation } = require('../utilities/EventLog');

class ReviewLoader {
    constructor(file) {
        this.file = file;
    }

    /**
     * @param {Array<object>} rules rules that will be tested against file.
     * @return {Array<object>} comments related to the reviewed file
     */
    against(rules) {
        if (!rules) {
            logInformation(__filename, 'Review skipped (no rules provided)');

            return [];
        }

        const review = new ReviewHandler(this.file, rules);

        const comments = review.start();

        return comments;
    }
}

module.exports = ReviewLoader;
