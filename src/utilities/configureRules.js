const jsonpath = require('jsonpath');
const isPlainObject = require('lodash/isPlainObject');

module.exports = (rules) => {
    for (const categoryKey in rules) {
        const category = rules[categoryKey];

        if (isPlainObject(category)) {
            for (const subCategoryKey in category) {
                _setupRules(category[subCategoryKey]);
            }
        } else {
            _setupRules(category);
        }
    }
};

function _setupRules(arrayOfRules) {
    for (const rule of arrayOfRules) {
        const { rulename, config } = rule;

        rule.reference = require(`src/rules/${rulename}`);

        delete rule.rulename;

        jsonpath.apply(config, '$..regex', (value) => {
            return new RegExp(value);
        });
    }
}
