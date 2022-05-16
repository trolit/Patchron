module.exports = (pepegaContext, rulesConfig, file = null) => {
    let comments = [];

    rulesConfig.forEach((ruleConfig) => {
        if (ruleConfig.enabled) {
            const { reference: Rule, config } = ruleConfig;

            const instance = new Rule(pepegaContext, config);

            const ruleComments = instance.invoke(file);

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
