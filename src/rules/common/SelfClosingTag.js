const BaseRule = require('src/rules/Base');

class SelfClosingTagRule extends BaseRule {
    /**
     * simple rule that looks after tags that have no content and do not use self-closing tag.
     *
     * Note that HTML doesn't allow custom elements to be self-closing, only official "void" elements. Read more at: {@link https://vuejs.org/style-guide/rules-strongly-recommended.html#self-closing-components}
     *
     * @param {PatchronContext} patchronContext
     * @param {object} _
     * @param {Patch} file
     */
    constructor(patchronContext, _, file) {
        super(patchronContext, file);

        this.expression = /><\/.*>/;
    }

    invoke() {
        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);

        const reviewComments = this._reviewData(data);

        return reviewComments;
    }

    _reviewData(data) {
        const reviewComments = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (
                this.CUSTOM_LINES.includes(trimmedContent) ||
                trimmedContent.startsWith('@@')
            ) {
                continue;
            }

            const matchResult =
                trimmedContent.match(this.SHORTHAND_EVENT_EXPRESSION) ||
                trimmedContent.match(this.LONGHAND_EVENT_EXPRESSION);

            if (!matchResult) {
                continue;
            }

            const eventHandler = matchResult[1];

            if (eventHandler.includes('=') || eventHandler.startsWith('$')) {
                continue;
            }

            const result = {
                isWithPrefix: this.prefix
                    ? eventHandler.startsWith(this.prefix)
                    : true,

                hasNoUnnecessaryBraces: this.noUnnecessaryBraces
                    ? trimmedContent.includes('()') ||
                      trimmedContent.includes('($event)')
                    : false
            };

            if (!result.isWithPrefix || result.hasNoUnnecessaryBraces) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(result),
                        index
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = SelfClosingTagRule;
