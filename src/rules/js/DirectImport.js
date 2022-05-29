/// <reference path="../../config/type-definitions/rules/js/DirectImport.js" />

const BaseRule = require('src/rules/Base');

class DirectImportRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {DirectImportConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

        const { packages } = config;

        this.packages = packages;
    }

    invoke() {
        if (!this.packages.length) {
            this.log.warning(__filename, 'No packages defined', this.file);

            return [];
        }

        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);

        if (!this._includesAnyMatch(data)) {
            return [];
        }

        const reviewComments = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            if (this.CUSTOM_LINES.includes(trimmedContent)) {
                continue;
            }

            const myPackage = this.packages.find(({ expression }) =>
                trimmedContent.match(expression)
            );

            if (myPackage) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(myPackage),
                        index
                    })
                );
            }
        }

        return reviewComments;
    }

    _includesAnyMatch(data) {
        return data.some(({ trimmedContent }) =>
            this.packages.some(({ expression }) =>
                trimmedContent.match(expression)
            )
        );
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `xDD.`;
    }
}

module.exports = DirectImportRule;
