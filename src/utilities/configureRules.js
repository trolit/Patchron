const isPlainObject = require('lodash/isPlainObject');

/**
 * takes collection of rules configuration (json file) and swaps `rulename` of each rule with `reference`
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
        const { rulename } = rule;

        rule.reference = require(`src/rules/${rulename}`);

        delete rule.rulename;
    }
}
