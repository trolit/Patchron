const isArray = require('lodash/isArray');
const isPlainObject = require('lodash/isPlainObject');

/**
 * @param {PatchronContext} patchronContext
 * @param {Array<object>} rules
 * @param {Patch} file
 * @returns {Array<object>}
 */
module.exports = (patchronContext, rules, file = null) => {
    let comments = [];

    rules.forEach((rule) => {
        if (rule.enabled) {
            const { reference: Rule } = rule;

            const instance = new Rule(patchronContext, rule?.config, file);

            const ruleComments = instance.invoke();

            if (isPlainObject(ruleComments)) {
                comments.push(ruleComments);
            } else if (isArray(ruleComments) && ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
