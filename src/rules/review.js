module.exports = (pepegaContext, rules, file = null) => {
    let comments = [];

    rules.forEach((rule) => {
        if (rule.enabled) {
            const ruleComments = rule.instance.invoke(pepegaContext, file);

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
