const review = require('../review');

class Js {
    static review(file, rules) {
        if (!rules.js.length) {
            probotInstance.log.warn(
                `Attempted to review file against js rules but no rules were provided: ${__filename}`
            );

            return [];
        }

        const comments = review(file, rules.js);

        return comments;
    }
}

module.exports = Js;
