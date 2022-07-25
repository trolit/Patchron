const BaseRule = require('src/rules/Base');

class FixedLoopLengthConditionRule extends BaseRule {
    /**
     * looks after `for`, `while`, `do while` loops and identifies whether condition statement includes reference to `length` property. If it does, line is commented out with description to not call `length` in each iteration suggesting to declare variable before loop instead.
     *
     * @param {PatchronContext} patchronContext
     * @param {FixedLoopLengthConditionConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { expression } = config;

        this.expression = expression;
    }

    invoke() {
        const data = this.setupData(this.file.splitPatch);
        const dataLength = data.length;
        const reviewComments = [];

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (
                this.CUSTOM_LINES.includes(trimmedContent) ||
                trimmedContent.startsWith(this.HUNK_HEADER_INDICATOR)
            ) {
                continue;
            }

            const fixedContent = trimmedContent.startsWith('}')
                ? trimmedContent.slice(1).trim()
                : trimmedContent;

            if (!this._startsWithStatement(fixedContent)) {
                continue;
            }

            let result = { isValid: true };

            if (fixedContent.startsWith('for')) {
                result = this._validateForLoop(data, index, fixedContent);
            } else if (fixedContent.startsWith('while')) {
                result = this._validateWhileLoop(data, index, fixedContent);
            }

            if (result && !result.isValid) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(),
                        index
                    })
                );
            }

            if (result?.lastIndex) {
                index = result.lastIndex;
            }
        }

        return reviewComments;
    }

    _startsWithStatement(content) {
        const statements = ['for', 'while'];

        return statements.some((statement) => content.startsWith(statement));
    }

    _validateForLoop(data, index, fixedContent) {
        const isSingleLine = fixedContent.match(/for.*\(.*;.*;.*\)/);

        if (isSingleLine) {
            const firstSemicolon = fixedContent.indexOf(';');
            const secondSemicolon = fixedContent.indexOf(
                ';',
                firstSemicolon + 1
            );

            const conditionStatement = fixedContent.slice(
                firstSemicolon,
                secondSemicolon + 1
            );

            return {
                isValid: this._matchLengthReference(conditionStatement) === null
            };
        } else {
            return this._isFragmentedLoopValid(data, index, 'for');
        }
    }

    _validateWhileLoop(data, index, fixedContent) {
        const isSingleLine = fixedContent.match(/while.*\(.*\)/);

        if (isSingleLine) {
            return {
                isValid: this._matchLengthReference(fixedContent) === null
            };
        } else {
            return this._isFragmentedLoopValid(data, index, 'while');
        }
    }

    _isFragmentedLoopValid(data, index, loopType) {
        let isValid = true;
        let lastIndex = index;
        const dataLength = data.length;

        const nextRowIndex =
            loopType === 'for'
                ? this._findForLoopConditionStatement(data, index)
                : index + 1;

        if (nextRowIndex > dataLength || nextRowIndex < 0) {
            return null;
        }

        const { indentation } = data[nextRowIndex];

        for (
            lastIndex = nextRowIndex + 1;
            lastIndex < dataLength;
            lastIndex++
        ) {
            const row = data[lastIndex];

            if (row.indentation !== indentation) {
                break;
            }

            if (this._matchLengthReference(row.trimmedContent)) {
                isValid = false;

                break;
            }
        }

        return {
            isValid,
            lastIndex
        };
    }

    _findForLoopConditionStatement(data, startIndex) {
        const conditionStatementIndex = data.findIndex(
            ({ trimmedContent, index: rowIndex }) =>
                rowIndex > startIndex && trimmedContent.endsWith(';')
        );

        return conditionStatementIndex > 0 ? conditionStatementIndex + 1 : -1;
    }

    _matchLengthReference(content) {
        return content.match(this.expression);
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `It seems that \`length\` property is initialized in condition statement. Please initialize it before loop.`;
    }
}

module.exports = FixedLoopLengthConditionRule;
