const BaseRule = require('src/rules/Base');

class SimplePropertyAssignmentRule extends BaseRule {
    /**
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
                trimmedContent.startsWith('@@') ||
                this.CUSTOM_LINES.includes(trimmedContent)
            ) {
                continue;
            }

            if (trimmedContent.includes('{') && trimmedContent.includes('}')) {
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
        const splitTestString = testString.split(':');

        if (splitTestString.length < 2) {
            return false;
        }

        const propertyName = splitTestString[0].trim();
        const propertyValue = splitTestString[1].trim();

        return propertyName === propertyValue;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `It seems that there is redundant value assignment (assigned value has the same name as key) :thinking:`;
    }
}

module.exports = SimplePropertyAssignmentRule;
