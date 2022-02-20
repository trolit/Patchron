const review = require('../review');

class Vue {
    static review(file, rules) {
        if (!rules.files.vue.length) {
            probotInstance.log.warn(
                `Attempted to review file against vue rules but no rules were provided: ${__filename}`
            );

            return [];
        }

        const comments = review(file, rules.files.vue);

        return comments;
    }
}

module.exports = Vue;
