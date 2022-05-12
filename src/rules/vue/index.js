const review = require('../review');
const { logWarning } = require('../../utilities/EventLog');

class Vue {
    static review(file, rules) {
        if (!rules.files.vue.length) {
            logWarning(
                __filename,
                'Attempted to review file against [ vue ] rules but no relevant rules were provided'
            );

            return [];
        }

        const comments = review(file, rules.files.vue);

        return comments;
    }
}

module.exports = Vue;
