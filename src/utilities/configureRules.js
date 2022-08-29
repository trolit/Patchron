const jsonpath = require('jsonpath');
const isPlainObject = require('lodash/isPlainObject');

/**
 * takes collection of rules configuration (json file) and adjusts it by:
 * - swapping `rulename` for rule instance through `reference` property
 * - parsing all config properties that are named `regex`
 *
 * @param {object} rules
 */
module.exports = (rules) => {
    for (const categoryKey in rules) {
        const category = rules[categoryKey];

        if (isPlainObject(category)) {
            for (const subCategoryKey in category) {
                const subCategory = category[subCategoryKey];

                if (isPlainObject(subCategory)) {
                    for (const subSubCategoryKey in subCategory) {
                        _setupRules(subCategory[subSubCategoryKey]);
                    }

                    continue;
                }

                _setupRules(category[subCategoryKey]);
            }

            continue;
        }

        _setupRules(category);
    }

    return rules;
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
