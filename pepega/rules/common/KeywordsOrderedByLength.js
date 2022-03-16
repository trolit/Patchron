const BaseRule = require('../Base');
const dedent = require('dedent-js');

class KeywordsOrderedByLengthRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, order: 'ascending'|'descending', ignoreNewline: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - regular expression to match line with keyword
     * @param {string} config.keywords[].order - ascending/descending
     * @param {string} config.keywords[].ignoreNewline - when set to 'true' **(not recommended)**, rule is tested against all keywords
     * matched in file and when 'false' **(recommended)**, only adjacent ones.
     *
     * e.g. when keywords are at lines: 0, 1, 2, 5, 6, 10, 'false' makes that rule apply only across group:
     * [0, 1, 2] and [5, 6]).
     */
    constructor(config) {
        super();

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke(file) {
        const keywords = this.keywords;

        if (!keywords.length) {
            probotInstance.log.error(
                `Couldn't run rule ${__filename} on ${file.filename}. No keywords defined.`
            );

            return [];
        }

        const { split_patch: splitPatch } = file;

        let reviewComments = [];

        for (const keyword of keywords) {
            const { matchedRows, unchangedRows } =
                this.initializeRegexBasedData(splitPatch, keyword);

            if (matchedRows.length <= 1) {
                continue;
            }

            if (keyword.ignoreNewline) {
                reviewComments.push(
                    ...this._reviewLinesOrderIgnoringNewline({
                        file,
                        keyword,
                        matchedRows,
                    })
                );
            } else {
                reviewComments.push(
                    ...this._reviewLinesOrder({
                        file,
                        keyword,
                        matchedRows,
                        unchangedRows,
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object> }} data
     */
    _reviewLinesOrderIgnoringNewline(data) {
        const { matchedRows, keyword } = data;
        let reviewComments = [];

        const baseArray = this._removeCustomLinesFromArray(matchedRows);

        const expectedArray = this._sortMatchedRows(baseArray, keyword);

        for (let index = 0; index < baseArray.length; index++) {
            const baseRow = baseArray[index];
            const expectedRow = expectedArray[index];

            if (baseRow.content !== expectedRow.content) {
                reviewComments.push(
                    this.getSingleLineComment({
                        ...data,
                        body: this._getCommentBody(keyword),
                        index: baseRow.index,
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @param {{ file: object, keyword: object, matchedRows: Array<object>, unchangedRows: Array<object> }} data
     */
    _reviewLinesOrder(data) {
        const { matchedRows, keyword } = data;

        const sortedMatchedRows = this._sortMatchedRows(matchedRows, keyword);

        const splitMatchedRows = this._splitMatchedRowsIntoGroups(matchedRows);

        const splitSortedMatchedRows =
            this._splitMatchedRowsIntoGroups(sortedMatchedRows);

        let reviewComments = [];

        for (
            let groupIndex = 0;
            groupIndex < splitMatchedRows.length;
            groupIndex++
        ) {
            const group = splitMatchedRows[groupIndex];
            const sortedGroup = splitSortedMatchedRows[groupIndex];

            for (
                let elementIndex = 0;
                elementIndex < sortedGroup.length;
                elementIndex++
            ) {
                const groupElement = group[elementIndex];
                const sortedGroupElement = sortedGroup[elementIndex];

                if (sortedGroupElement.index !== groupElement.index) {
                    const rowsWithCode = group.filter(
                        (element) => element.content !== this.merge
                    );

                    const { index: firstElementIndex } = rowsWithCode[0];
                    const { index: lastElementIndex } = rowsWithCode.pop();

                    reviewComments.push(
                        this.getMultilineComment({
                            ...data,
                            body: this._getCommentBody(keyword),
                            from: firstElementIndex,
                            to: lastElementIndex,
                        })
                    );

                    break;
                }
            }
        }

        return reviewComments;
    }

    _removeCustomLinesFromArray(array) {
        return array.filter(
            ({ content }) => !this.customLines.includes(content)
        );
    }

    _sortMatchedRows(matchedRows, keyword) {
        const customLines = this.customLines;
        const { order } = keyword;

        return [...matchedRows].sort((firstRow, secondRow) => {
            const { content: firstRowContent } = firstRow;
            const { content: secondRowContent } = secondRow;

            if (
                customLines.includes(firstRowContent) ||
                customLines.includes(secondRowContent) ||
                firstRowContent === secondRowContent
            ) {
                return 0;
            }

            switch (order) {
                case 'ascending':
                    return firstRowContent.length < secondRowContent.length
                        ? -1
                        : 1;

                case 'descending':
                    return firstRowContent.length > secondRowContent.length
                        ? -1
                        : 1;

                default:
                    return 0;
            }
        });
    }

    _splitMatchedRowsIntoGroups(matchedRows) {
        let result = [];
        let index = 0;

        while (index < matchedRows.length) {
            let group = [];

            for (; index < matchedRows.length; index++) {
                const matchedRow = matchedRows[index];

                if (matchedRow.content.includes(this.newLine)) {
                    index++;

                    break;
                }

                group.push(matchedRow);
            }

            if (this._isInvalidGroup(group)) {
                continue;
            }

            result.push(group);
        }

        return result;
    }

    _isInvalidGroup(group) {
        const hasNotEnoughRowsWithCode =
            group.filter(({ content }) => content !== this.merge).length <= 1;

        return group === [] || hasNotEnoughRowsWithCode;
    }

    _getCommentBody(keyword) {
        const commentBody = `Keep \`${keyword.order}\` order for keyword: \`${keyword.name}\``;

        return dedent(commentBody);
    }
}

module.exports = KeywordsOrderedByLengthRule;
