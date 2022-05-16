const dedent = require('dedent-js');
const isEqual = require('lodash/isEqual');

const BaseRule = require('../Base');

class ValueComparisionStyleRule extends BaseRule {
    /**
     * Allows to set expected equality/inequality comparement convention. Rule is based on patch and currently does not implement any way to deduce whether part of patch is pure text or part of code (e.g. in case of Vue). An workaround to that could be to escape `=` characters in strings and use `=` unicode representation in HTML.
     *
     *
     * **allowedLevels** options:
     * - 0 - weak equality/inequality (==, !=)
     * - 1 - strict equality/inequality (===, !==)
     * - 2 - strict equality/inequality via `Object.is` (ES6)
     * @param {object} config
     * @param {Array<number>} config.allowedLevels pass which levels are allowed
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality
     */
    constructor(pepegaContext, config) {
        super(pepegaContext);

        const { allowedLevels } = config;
        allowedLevels.sort();

        const defaultPatterns = [
            {
                level: 0,
                text: '==, !=',
                expressions: [
                    /[\sa-zA-Z0-9]==[\sa-zA-Z0-9]/g,
                    /[\sa-zA-Z0-9]!=[\sa-zA-Z0-9]/g
                ]
            },
            {
                level: 1,
                text: '===, !==',
                expressions: [
                    /[\sa-zA-Z0-9]===[\sa-zA-Z0-9]/g,
                    /[\sa-zA-Z0-9]!==[\sa-zA-Z0-9]/g
                ]
            },
            {
                level: 2,
                text: 'Object.is',
                expressions: [/(?:Object.is\(.*\))|(?:Object.is\()/g]
            }
        ];

        this.allowedLevels = allowedLevels;
        this.defaultPatterns = defaultPatterns;
    }

    invoke(file) {
        if (!this.allowedLevels?.length) {
            return [];
        }

        if (isEqual(this.allowedLevels, [0, 1, 2])) {
            this.logWarning(
                __filename,
                `All comparision styles are allowed, nothing to do.`,
                file
            );

            return [];
        }

        const { split_patch: splitPatch } = file;

        const data = this.setupData(splitPatch, {
            withBackticks: {
                settings: {
                    abortOnUnevenBackticksCountInPatch: true
                }
            }
        });

        if (!this._hasAnyMatchingComparision(data)) {
            return [];
        }

        const reviewComments = this._reviewData(file, data);

        return reviewComments;
    }

    _hasAnyMatchingComparision(data) {
        return data.some(({ trimmedContent }) =>
            this.defaultPatterns.some((defaultPattern) =>
                trimmedContent.match(defaultPattern)
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
                this.CUSTOM_LINES.includes(line.content) ||
                line.content.startsWith('@@')
            ) {
                continue;
            }

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
                    line?.endIndex
                        ? {
                              ...this.getMultiLineComment({
                                  file,
                                  body: this._getCommentBody(),
                                  from: line.startIndex,
                                  to: line.endIndex
                              })
                          }
                        : {
                              ...this.getSingleLineComment({
                                  file,
                                  body: this._getCommentBody(),
                                  index: line.startIndex
                              })
                          }
                );
            }
        }

        return reviewComments;
    }

    _isLineValid(line) {
        let isRowValid = true;
        const defaultPatternsLength = this.defaultPatterns.length;

        for (let index = 0; index < defaultPatternsLength; index++) {
            const { expressions, level } = this.defaultPatterns[index];

            if (this.allowedLevels.includes(level)) {
                continue;
            }

            for (const expression of expressions) {
                const matches = [...line.matchAll(expression)];

                if (matches.length) {
                    isRowValid = false;
                }
            }

            if (!isRowValid) {
                break;
            }
        }

        return isRowValid;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        const allowedPatterns = this.defaultPatterns
            .map(({ text, level }) => {
                return this.allowedLevels.includes(level) ? text : null;
            })
            .filter((text) => text);

        return dedent(`It seems that marked fragment includes comparision pattern. If it's raw text, ignore this comment or consider using unicode representation of = character or escape it with backslash.

        Allowed comparision patterns: (${allowedPatterns.join(', ')})`);
    }
}

module.exports = ValueComparisionStyleRule;
