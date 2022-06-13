const BaseRule = require('src/rules/Base');

class ImportWithoutExtensionRule extends BaseRule {
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);
    }

    invoke() {}
}

module.exports = ImportWithoutExtensionRule;
