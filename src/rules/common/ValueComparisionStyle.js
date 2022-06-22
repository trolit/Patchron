/// <reference path="../../config/type-definitions/common.js" />
/// <reference path="../../config/type-definitions/rules/common/ValueComparisionStyle.js" />

const isEqual = require('lodash/isEqual');
const BaseRule = require('src/rules/Base');

class ValueComparisionStyleRule extends BaseRule {
    /**
     * Allows to set expected equality/inequality comparement convention. Rule is based on patch and currently does not implement any way to deduce whether part of patch is pure text or part of code (e.g. in case of Vue). An workaround to that could be to escape `=` characters in strings and use `=` unicode representation in HTML.
     *
     * **allowedLevels** options:
     * - 0 - weak equality/inequality (==, !=)
     * - 1 - strict equality/inequality (===, !==)
     * - 2 - strict equality/inequality via `Object.is` (ES6)
     *
     * @param {PatchronContext} patchronContext
     * @param {ValueComparisionStyleConfig} config
     * @param {Patch} file
     *
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals}
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness}
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality}
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

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

    invoke() {
        if (!this.allowedLevels?.length) {
            return [];
        }

        if (isEqual(this.allowedLevels, [0, 1, 2])) {
            this.log.warning(
                __filename,
                `All comparision styles are allowed, nothing to do.`,
                this.file
            );

            return [];
        }

        const { splitPatch } = this.file;

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

        const reviewComments = this._reviewData(data);

        return reviewComments;
    }

    _hasAnyMatchingComparision(data) {
        return data.some(({ trimmedContent }) =>
            this.defaultPatterns.some((defaultPattern) =>
                trimmedContent.match(defaultPattern)
            )
        );
    }

    _reviewData(data) {
        const reviewComments = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const backticks = row?.backticks;
            const line = { index, content: row.trimmedContent };

            if (
                this.CUSTOM_LINES.includes(line.content) ||
                line.content.startsWith('@@')
            ) {
                continue;
            }

            if (backticks && backticks.index !== backticks.endLineIndex) {
                const { endLineIndex } = backticks;
                line.endIndex = endLineIndex;

                line.content = this.convertMultiLineToSingleLine(
                    data,
                    line.index,
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
                                  body: this._getCommentBody(),
                                  from: line.index,
                                  to: line.endIndex
                              })
                          }
                        : {
                              ...this.getSingleLineComment({
                                  body: this._getCommentBody(),
                                  index: line.index
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

        return this
            .dedent(`It seems that marked fragment includes comparision pattern. If it's raw text, ignore this comment or consider using unicode representation of = character or escape it with backslash.

        Allowed comparision patterns: (${allowedPatterns.join(', ')})`);
    }
}

module.exports = ValueComparisionStyleRule;
