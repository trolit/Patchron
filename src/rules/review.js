/**
 * @param {PatchronContext} patchronContext
 * @param {Array<object>} rulesConfig
 * @param {Patch} file
 * @returns {Array<object>}
 */
module.exports = (patchronContext, rulesConfig, file = null) => {
    let comments = [];

    rulesConfig.forEach((ruleConfig) => {
        if (ruleConfig.enabled) {
            const { reference: Rule, config } = ruleConfig;

            const instance = new Rule(patchronContext, config, file);

            const ruleComments = instance.invoke();

            if (ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
