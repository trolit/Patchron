const dedent = require('dedent-js');
const BaseRule = require('../Base');
const getLineNumber = require('../../helpers/getLineNumber');

class SingleLineBlockRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, expression: object}>} config.blocks
     * @param {boolean} config.curlyBraces - true indicates that matched blocks should be wrapped with curly braces {}
     */
    constructor(config) {
        super();

        const { blocks, curlyBraces } = config;

        this.blocks = blocks;
        this.curlyBraces = curlyBraces;
    }

    invoke(file) {
        const blocks = this.blocks;

        if (!blocks.length) {
            this.logError(__filename, 'No blocks defined.', file);

            return [];
        }

        const { split_patch: splitPatch } = file;

        if (!splitPatch) {
            this.logError(__filename, 'Empty patch', file);

            return [];
        }

        const data = this.setupData(splitPatch);

        let reviewComments = [];

        // solve

        return reviewComments;
    }

    _matchKeywordData(splitPatch, data, keyword) {
        let matchedData = [];

        for (let index = 0; index < data.length; index++) {
            const matchResult = data[index].content.match(keyword.regex);

            if (matchResult) {
                const content = matchResult[0];

                const isMultiLine =
                    keyword?.multilineOptions?.length &&
                    this.isPartOfMultiLine(keyword, content);

                if (isMultiLine) {
                    const multilineEndIndex = this.getMultiLineEndIndex(
                        splitPatch,
                        keyword,
                        index
                    );

                    const content = this.convertMultiLineToSingleLine(
                        data,
                        index,
                        multilineEndIndex
                    );

                    matchedData.push({
                        index,
                        content,
                        length: multilineEndIndex - index
                    });

                    index = multilineEndIndex;
                } else {
                    matchedData.push({
                        index,
                        content: content
                    });
                }
            }
        }

        return matchedData;
    }

    /**
     * @param {object} keyword
     * @param {Array<string>} splitPatch
     * @param {object} review
     */
    _getCommentBody(keyword, splitPatch, review) {
        const { from, to, distance, reason } = review;
        const { maxLineBreaks, name } = keyword;

        const fromLineNumber = getLineNumber(splitPatch, this.RIGHT, from);
        const toLineNumber = getLineNumber(splitPatch, this.RIGHT, to);

        let commentBody = '';

        switch (reason) {
            case 'tooManyLineBreaks':
                commentBody = `Found \`${distance}\` line(s) between \`${name}\` lines \`${fromLineNumber}\` and \`${toLineNumber}\` but ${
                    maxLineBreaks
                        ? `only \`${maxLineBreaks}\` are allowed`
                        : `there shouldn't be any`
                }`;
                break;

            case 'differentCode':
                commentBody = `Fragment between \`line: ${fromLineNumber}\` and \`line: ${toLineNumber}\` should ${
                    maxLineBreaks
                        ? `only consist of line breaks (max: ${maxLineBreaks})`
                        : `not contain any code or line breaks`
                }`;
                break;
        }

        return dedent(commentBody);
    }
}

module.exports = SingleLineBlockRule;
