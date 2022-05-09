const BaseRule = require('../Base');
const getContentNesting = require('../../helpers/getContentNesting');

class ValueComparisionStyleRule extends BaseRule {
    /**
     * Allows to set expected equality/inequality comparement convention. Rule by default covers basic usage `(==, ===, Object.is)`. Custom ones can be passed via `specificPatterns` array.
     *
     * **allowedLevels** options:
     * - 0 - weak equality (==)
     * - 1 - strict equality (===)
     * - 2 - strict equality (Object.is)
     * @param {object} config
     * @param {Array<number>} config.allowedLevels pass which levels are allowed
     * @param {Array<{expression: object, level: number}>} config.specificPatterns to handle custom cases
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality
     */
    constructor(config) {
        super();

        const { allowedLevels, specificPatterns } = config;

        const defaultPatterns = [
            { expression: /(?:={2})/, levels: [0, 1] },
            { expression: /(?:Object.is\(.*\))/, levels: [2] }
        ];

        this.allowedLevels = allowedLevels;
        this.defaultPatterns = defaultPatterns;
        this.specificPatterns = specificPatterns;
    }

    invoke(file) {
        const { split_patch: splitPatch } = file;

        console.table(splitPatch);

        const data = this.setupData(splitPatch, {
            withBackticks: {
                settings: { abortOnUnevenBackticksCountInPatch: true }
            }
        });

        console.table(data);

        if (!this._hasAnyMatchingComparision(data)) {
            this.logWarning(
                __filename,
                `${file?.filename} review skipped due to no matches.`,
                file
            );

            return [];
        }

        // const contentNesting = getContentNesting(data);

        // const matchedData = this.extendDataWithBackticks(data);

        const reviewComments = [];

        return reviewComments;
    }

    _hasAnyMatchingComparision(data) {
        return data.some(
            ({ trimmedContent }) =>
                this.defaultPatterns.some((defaultPattern) =>
                    trimmedContent.match(defaultPattern)
                ) ||
                this.specificPatterns.some(({ expression }) =>
                    trimmedContent.match(expression)
                )
        );
    }

    _reviewRowWithTemplateLiteral(row, contentNesting) {}

    _reviewRowWithDefaultPatterns(row) {
        const defaultPatternsLength = this.defaultPatterns.length;
        let isRowValid = false;

        for (let index = 0; index < defaultPatternsLength; index++) {
            const { expression, levels } = this.defaultPatterns[index];

            const matches = row.matchAll(expression);

            for (const match of matches) {
                if (this._isPatternAllowed(levels)) {
                    isRowValid = true;

                    break;
                }
            }
        }
    }

    _isMatchFromDefaultPatternValid(match, patternLevels) {
        if (patternLevels === [0, 1]) {
        }
        return this.allowedLevels.some((allowedLevel) =>
            patternLevels.includes(allowedLevel)
        );
    }


    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `This single-line block should${
            this.curlyBraces ? `` : `n't`
        } be wrapped with curly braces.`;
    }
}

module.exports = ValueComparisionStyleRule;
