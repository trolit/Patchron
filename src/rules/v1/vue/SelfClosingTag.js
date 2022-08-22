const BaseRule = require('src/rules/Base');

class SelfClosingTagRule extends BaseRule {
    /**
     * looks after tags that have no content and do not use self-closing tag. Note that HTML doesn't allow custom elements to be self-closing, only official "void" elements. Read more at: {@link https://vuejs.org/style-guide/rules-strongly-recommended.html#self-closing-components}
     *
     * @param {PatchronContext} patchronContext
     * @param {object} _
     * @param {Patch} file
     */
    constructor(patchronContext, _, file) {
        super(patchronContext, file);

        this.regex = /><\/.*>/;
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
                trimmedContent.startsWith(this.HUNK_HEADER_INDICATOR)
            ) {
                continue;
            }

            if (trimmedContent.match(this.regex)) {
                reviewComments.push(
                    this.getSingleLineComment({
                        index,
                        body: this._getCommentBody()
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
        return `It seems that the tag can be self-enclosed :thinking:`;
    }
}

module.exports = SelfClosingTagRule;
