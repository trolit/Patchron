const BaseRule = require('../Base');

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
     * @param {Array<{name: string, expression: object, levels: number}>} config.specificPatterns to handle custom cases
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality
     */
    constructor(config) {
        super();

        const { allowedLevels, specificPatterns } = config;

        const defaultPatterns = [
            {
                levels: [0, 1],
                expression: /(?:={2,3})/g
            },
            {
                levels: [2],
                expression: /(?:Object.is\(.*\))/g
            }
        ];

        this.allowedLevels = allowedLevels;
        this.defaultPatterns = defaultPatterns;
        this.specificPatterns = specificPatterns;
    }

    invoke(file) {
        const { split_patch: splitPatch } = file;

        const data = this.setupData(splitPatch, {
            withBackticks: {
                settings: { abortOnUnevenBackticksCountInPatch: true }
            }
        });

        if (!this._hasAnyMatchingComparision(data)) {
            this.logWarning(
                __filename,
                `${file?.filename} review skipped due to no matches.`,
                file
            );

            return [];
        }

        const reviewComments = this._reviewData(file, data);

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

    _reviewData(file, data) {
        const reviewComments = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const backticks = row?.backticks;
            const line = { content: row.trimmedContent, startIndex: index };

            if (
                backticks &&
                backticks.startLineIndex !== backticks.endLineIndex
            ) {
                const { startLineIndex, endLineIndex } = backticks;
                line.startIndex = startLineIndex;
                line.endIndex = endLineIndex;

                line.content = this.convertMultiLineToSingleLine(
                    data,
                    startLineIndex,
                    endLineIndex
                );

                index = endLineIndex;
            }

            const isLineValid = this._isLineValid(line.content);

            if (!isLineValid) {
                reviewComments.push(
                    this.line?.endIndex
                        ? {
                              ...this.getMultiLineComment({
                                  file,
                                  body: this._getCommentBody(),
                                  from: this.line.startIndex,
                                  to: this.line.endIndex
                              })
                          }
                        : {
                              ...this.getSingleLineComment({
                                  file,
                                  body: this._getCommentBody(),
                                  index: this.line.startIndex
                              })
                          }
                );
            }
        }

        return reviewComments;
    }

    _isLineValid(line) {
        const patterns = [...this.defaultPatterns, ...this.specificPatterns];
        const patternsLength = patterns.length;
        let isRowValid = true;

        for (let index = 0; index < patternsLength; index++) {
            const { expression, levels } = patterns[index];

            const matches = line.matchAll(expression);

            if (!matches.length) {
                break;
            }

            for (const match of matches) {
                if (!this._isMatchValid(match, levels)) {
                    isRowValid = false;

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
