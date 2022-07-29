/** Class representing review comment builder. */
class ReviewCommentBuilder {
    /**
     *
     * @param {PatchronContext} patchronContext
     * @param {Patch} file
     */
    constructor(patchronContext, file) {
        const { pullRequest, repo } = patchronContext;
        const { commitId: commit_id } = file;

        this.basicInformation = {
            ...repo,
            commit_id,
            path: file.filename,
            pull_number: pullRequest.id
        };
    }

    /**
     * builds single line review comment
     *
     * @param {object} data
     * @param {string} data.body review comment
     * @param {string} data.line line number
     * @param {string} data.side which side line refers to (LEFT=deletion, RIGHT=addition)
     * @returns {object}
     */
    buildSingleLineComment(data) {
        const { body, line, side } = data;

        const comment = {
            ...this.basicInformation,
            body,
            line,
            side
        };

        return comment;
    }

    /**
     * builds multi line review comment
     *
     * @param {object} data
     * @param {string} data.body review comment
     * @param {string} data.start_line line number (counted from line after '@@')
     * @param {string} data.start_side which side line refers to (LEFT=deletion, RIGHT=addition)
     * @param {string} data.line line that marks end of multi-line comment
     * @returns {object}
     */
    buildMultiLineComment(data) {
        const { body, start_line, start_side, line } = data;

        const comment = {
            ...this.basicInformation,
            body,
            line,
            start_line,
            start_side
        };

        return comment;
    }
}

module.exports = ReviewCommentBuilder;
