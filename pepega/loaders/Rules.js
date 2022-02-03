const Review = require('./Review');

class RulesLoader {
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

        const review = new Review(this.file, rules);

        const comments = review.start();

        return comments;
    }
}

module.exports = RulesLoader;