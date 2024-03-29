const BaseRule = require('src/rules/Base');

class SimplePropertyAssignmentRule extends BaseRule {
    /**
     * checks lines that are property assignments. If in such assignment value name is the same as property name (e.g. `var1: var1`), line is commented out.
     *
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        this.singleLinePropertyExpression = /((\w+):.*?)[,|}]/g;

        this.multiLinePropertyExpression = /((\w+):.*?)[,|}]/;

        this.multiLineLastPropertyExpression = /((\w+):.*)/;
    }

    invoke() {
        const { splitPatch } = this.file;

        const data = this.setupData(splitPatch);
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

            if (
                trimmedContent.includes(this.BLOCK_START) &&
                trimmedContent.includes(this.BLOCK_END)
            ) {
                const matches = trimmedContent.matchAll(
                    this.singleLinePropertyExpression
                );

                if (!matches) {
                    continue;
                }

                for (const match of matches) {
                    const testString = match[1];

                    if (this._isNotSimpleAssignment(testString)) {
                        reviewComments.push(
                            this.getSingleLineComment({
                                body: this._getCommentBody(),
                                index
                            })
                        );
                    }
                }

                continue;
            }

            const multiLinePropertyMatch = trimmedContent.match(
                this.multiLinePropertyExpression
            );

            if (multiLinePropertyMatch) {
                const testString = multiLinePropertyMatch[1];

                if (this._isNotSimpleAssignment(testString)) {
                    reviewComments.push(
                        this.getSingleLineComment({
                            body: this._getCommentBody(),
                            index
                        })
                    );
                }

                continue;
            }

            const multiLineLastPropertyMatch = trimmedContent.match(
                this.multiLineLastPropertyExpression
            );

            if (multiLineLastPropertyMatch) {
                const testString = multiLineLastPropertyMatch[1];

                if (this._isNotSimpleAssignment(testString)) {
                    reviewComments.push(
                        this.getSingleLineComment({
                            body: this._getCommentBody(),
                            index
                        })
                    );
                }
            }
        }

        return reviewComments;
    }

    _isNotSimpleAssignment(testString) {
        let splitTestString = [testString];

        if (testString.includes(this.BLOCK_START)) {
            splitTestString = testString.split(this.BLOCK_START);
        }

        for (const part of splitTestString) {
            const splitPart = part.split(':');

            if (splitPart.length < 2) {
                continue;
            }

            const propertyName = splitPart[0].trim();
            const propertyValue = splitPart[1].trim();

            if (!propertyValue) {
                continue;
            }

            if (propertyName === propertyValue) {
                return true;
            }
        }

        return false;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `It seems that there is redundant value assignment (assigned value has the same name as key) :thinking:`;
    }
}

module.exports = SimplePropertyAssignmentRule;
