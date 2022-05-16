module.exports = (pepegaContext, rules, file = null) => {
    let comments = [];

    rules.forEach((rule) => {
        if (rule.enabled) {
            const { reference: Rule, config } = rule;

            const instance = new Rule(pepegaContext, config);

            const ruleComments = instance.invoke(file);

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
