const Js = require('../rules/js');
const { decode } = require('js-base64');

class Review {
    constructor(file, rules) {
        this.file = {
            ...file,
            content: decode(file.content),
            extension: file.name.split('.').pop(),
        };

        this.rules = rules;
    }

    /**
     * @return {Array<string>} comments related to the reviewed file
     */
    start() {
        let comments = [];

        switch (this.file.extension) {
            case 'vue':
                comments = [...Js.review(this.file, this.rules)];
                break;
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
