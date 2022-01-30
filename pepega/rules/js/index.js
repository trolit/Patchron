class Js {
    static review(file, rules) {
        let comments = [];

        for (const rule in rules) {
            let rule_comments = rules[rule].invoke(file);

            if (rule_comments.length) {
                comments.push(...rule_comments);
            }
        }

        return comments;
    }
}

module.exports = Js;
