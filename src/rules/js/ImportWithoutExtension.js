/// <reference path="../../config/type-definitions/rules/js/ImportWithoutExtension.js" />

const BaseRule = require('src/rules/Base');

class ImportWithoutExtensionRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {ImportWithoutExtensionConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

        const { type } = config;

        this.type = type;
    }

    invoke() {}
}

module.exports = ImportWithoutExtensionRule;
