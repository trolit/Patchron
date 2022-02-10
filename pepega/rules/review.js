module.exports = (file, rules) => {
    let comments = [];

    rules.forEach((rule) => {
        if (rule.enabled) {
            const ruleComments = rule.instance.invoke(file);

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
