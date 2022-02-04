const Js = require('../rules/js');
const BasicDataBuilder = require('../builders/BasicData');

class ReviewHandler {
    constructor(file, rules) {
        this.file = {
            ...file,
            extension: file.filename.split('.').pop(),
        };

        this.rules = rules;
    }

    /**
     * @returns {Array<object>} comments related to the reviewed file
     */
    start() {
        const basicData = new BasicDataBuilder(this.file);

        let comments = [];

        switch (this.file.extension) {
            case 'vue':
                // TODO:
                comments = [...Js.review(this.file, this.rules.js)];
                break;
            case 'js':
                comments = Js.review(basicData, this.rules.js);
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

module.exports = ReviewHandler;
