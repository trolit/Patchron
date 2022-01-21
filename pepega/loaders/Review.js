const Js = require('../rules/js');
const { decode } = require('js-base64');

class Review {
    constructor(file, rules) {
        if (!file || !file.content) {
            probotInstance.log.warn(
                `Review skipped (no file found or it's content is empty): ${__filename}`
            );
        }

        this.file = {
            ...file,
            content: decode(file.content),
        };

        this.rules = rules;
    }

    /**
     * @return {Array<string>} comments related to the reviewed file
     */
    invoke() {
        let comments = [];

        switch (this.file.extension) {
            case 'js':
                comments = Js.review(this.file, this.rules);
                break;
            default:
                probotInstance.log.warn(
                    `Extension not supported: ${__filename}`
                );
                break;
        }

        return comments;
    }
}

module.exports = Review;
