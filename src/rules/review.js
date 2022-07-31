const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');

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

            if (isObject(ruleComments)) {
                comments.push(ruleComments);
            } else if (isArray(ruleComments) && ruleComments.length) {
                comments.push(...ruleComments);
            }
        }
    });

    return comments;
};
