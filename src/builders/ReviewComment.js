/** Class representing review comment builder. */
class ReviewCommentBuilder {
    /**
     *
     * @param {import('../builders/PepegaContext')} pepegaContext
     */
    constructor(pepegaContext) {
        const { pullRequest, repo } = pepegaContext;

        this.basicInformation = {
            ...repo,
            pull_number: pullRequest.id
        };
    }

    /**
     * builds single line review comment
     * @param {object} data
     * @param {string} data.body review comment
     * @param {string} data.line line number
     * @param {string} data.side which side line refers to (LEFT=deletion, RIGHT=addition)
     * @param {string} data.commit_id
     * @returns {object}
     */
    buildSingleLineComment(data) {
        const { body, line, side, commit_id } = data;

        const comment = {
            ...this.basicInformation,
            body,
            line,
            side,
            commit_id
        };

        return comment;
    }

    /**
     * builds multi line review comment
     * @param {object} data
     * @param {string} data.body review comment
     * @param {string} data.start_line line number (counted from line after '@@')
     * @param {string} data.start_side which side line refers to (LEFT=deletion, RIGHT=addition)
     * @param {string} data.position number of lines to take into review (counted from line after '@@')
     * @param {string} data.commit_id
     * @returns {object}
     */
    buildMultiLineComment(data) {
        const { body, start_line, start_side, position, commit_id } = data;

        const comment = {
            ...this.basicInformation,
            body,
            start_line,
            start_side,
            position,
            commit_id
        };

        return comment;
    }
}

module.exports = ReviewCommentBuilder;
