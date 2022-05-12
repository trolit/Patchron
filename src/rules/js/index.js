const review = require('../review');
const { logWarning } = require('../../utilities/EventLog');

class Js {
    static review(file, rules) {
        if (!rules.files.js.length) {
            logWarning(
                __filename,
                'Attempted to review file against [ js ] rules but no relevant rules were provided'
            );

            return [];
        }

        const comments = review(file, rules.files.js);

        return comments;
    }
}

module.exports = Js;
