const BaseRule = require('src/rules/Base');

class IndividualMethodImportRule extends BaseRule {
    /**
     * checks whether package methods are imported / required individually. For instance, when we consider **lodash** library, first two ways of `import` should be avoided.
     *
     * ```js
     * 1) import _ from 'lodash';
     * 2) import { uniq } from 'lodash';
     * 3) import uniq from 'lodash/uniq';
     * ```
     *
     * {@link https://www.blazemeter.com/blog/the-correct-way-to-import-lodash-libraries-a-benchmark}
     *
     * @param {PatchronContext} patchronContext
     * @param {IndividualMethodImportConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

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

            if (
                this.CUSTOM_LINES.includes(trimmedContent) ||
                trimmedContent.startsWith(this.HUNK_HEADER_INDICATOR)
            ) {
                continue;
            }

            const myPackage = this.packages.find(({ regex }) =>
                trimmedContent.match(regex)
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
            this.packages.some(({ regex }) => trimmedContent.match(regex))
        );
    }

    /**
     * @returns {string}
     */
    _getCommentBody(myPackage) {
        return `Please, import ${myPackage.name} features one-by-one, directly from the bundle.`;
    }
}

module.exports = IndividualMethodImportRule;
