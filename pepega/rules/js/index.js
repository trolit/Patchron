class Js {
    static review(file, rules) {
        let comments = [];

        rules.forEach((rule) => {
            const ruleComments = rule.instance.invoke(file);

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        });

        return comments;
    }
}

module.exports = Js;
