/**
 * @param {PepegaContext} pepegaContext
 * @param {Array<object>} rulesConfig
 * @param {Patch} file
 * @returns {Array<object>}
 */
module.exports = (pepegaContext, rulesConfig, file = null) => {
    let comments = [];

    rulesConfig.forEach((ruleConfig) => {
        if (ruleConfig.enabled) {
            const { reference: Rule, config } = ruleConfig;

            const instance = new Rule(pepegaContext, config, file);

            const ruleComments = instance.invoke();

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
