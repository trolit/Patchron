const Js = require('../rules/js');
const Vue = require('../rules/vue');
const { logInformation } = require('../utilities/EventLog');
const BasicDataBuilder = require('../builders/BasicData');

class ReviewHandler {
    constructor(file, rules) {
        this.file = {
            ...file,
            extension: file.filename.split('.').pop()
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
                comments = Vue.review(basicData, this.rules);
                break;

            case 'js':
                comments = Js.review(basicData, this.rules);
                break;

            default:
                logInformation(
                    __filename,
                    `Extension not supported (${this.file?.extension})`
                );

                break;
        }

        return comments;
    }
}

module.exports = ReviewHandler;