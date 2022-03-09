const getLineNumber = require('../helpers/getLineNumber');
const ReviewCommentBuilder = require('../builders/ReviewComment');

class BaseRule {
    constructor() {
        const merge = '<<< merge >>>';
        const newLine = '<<< new line >>>';

        this.merge = merge;
        this.newLine = newLine;
        this.customLines = [newLine, merge];
    }

    /**
     * @returns {object}
     */
    getSingleLineComment(file, body, rowIndex, side = 'RIGHT') {
        const { split_patch: splitPatch } = file;

        const line = getLineNumber(splitPatch, 'right', rowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildSingleLineComment({
            body,
            line,
            side,
        });

        return comment;
    }
}

module.exports = BaseRule;
