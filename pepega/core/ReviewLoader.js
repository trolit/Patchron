const ReviewHandler = require('./ReviewHandler');

class ReviewLoader {
    constructor(file) {
        this.file = file;
    }

    /**
     * @param {Array<string>} rules Rules that will be tested against file.
     * @return {Array<string>} comments related to the reviewed file
     */
    against(rules) {
        if (!rules) {
            probotInstance.log.warn(
                `Review skipped (no rules provided) -> ${__filename}`
            );

            return [];
        }

        const review = new ReviewHandler(this.file, rules);

        const comments = review.start();

        return comments;
    }
}

module.exports = ReviewLoader;