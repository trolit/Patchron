const dedent = require('dedent-js');
const getPosition = require('../../helpers/getPosition');
const getLineNumber = require('../../helpers/getLineNumber');
const ReviewCommentBuilder = require('../../builders/ReviewComment');

class KeywordsOrderedByLengthRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, order: 'ascending'|'descending', ignoreNewline: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - regular expression to match keyword
     * @param {string} config.keywords[].order - ascending/descending
     * @param {string} config.keywords[].ignoreNewline - when set to 'true' **(not recommended)**, rule is tested against all keywords
     * matched in file and when 'false' **(recommended)**, only adjacent ones.
     *
     * e.g. when keywords are at lines: 0, 1, 2, 5, 6, 10, 'false' makes that rule apply only across group:
     * [0, 1, 2] and [5, 6]).
     */
    constructor(config) {
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
            const { matchedRows, unchangedRows } = this._setupData(
                splitPatch,
                keyword
            );

            if (matchedRows.length <= 1) {
                continue;
            }

            if (keyword.ignoreNewline) {
                reviewComments.push(
                    ...this._reviewLinesOrderIgnoringNewline(
                        file,
                        keyword,
                        matchedRows
                    )
                );
            } else {
                reviewComments.push(
                    ...this._reviewLinesOrder(
                        file,
                        keyword,
                        matchedRows,
                        unchangedRows
                    )
                );
            }
        }

        return reviewComments;
    }

    _setupData(splitPatch, keyword) {
        let matchedRows = [];
        let unchangedRows = [];

        for (let rowIndex = 0; rowIndex < splitPatch.length; rowIndex++) {
            const rowContent = splitPatch[rowIndex];

            if (rowContent.trim().length === 0 || rowContent === '+') {
                matchedRows.push({
                    rowIndex,
                    matchedContent: '<<< new line >>>',
                });

                continue;
            } else if (rowContent.startsWith('-')) {
                matchedRows.push({
                    rowIndex,
                    matchedContent: '<<< merge >>>',
                });

                continue;
            } else if (rowContent.startsWith(' ')) {
                unchangedRows.push(rowIndex);
            }

            const matchResult = rowContent.match(keyword.regex);

            if (!matchResult) {
                continue;
            }

            matchedRows.push({
                rowIndex,
                matchedContent: matchResult[0].trim(),
            });
        }

        return {
            matchedRows,
            unchangedRows,
        };
    }

    _reviewLinesOrderIgnoringNewline(file, keyword, baseArray) {
        let reviewComments = [];

        const sortedArray = this._sortArray(keyword, baseArray);

        for (let index = 0; index < sortedArray.length; index++) {
            const baseElement = baseArray[index];
            const sortedElement = sortedArray[index];

            if (
                !['<<< new line >>>', '<<< merge >>>'].includes(
                    baseElement.matchedContent
                ) &&
                baseElement.rowIndex !== sortedElement.rowIndex
            ) {
                reviewComments.push(
                    this._getSingleLineComment(
                        file,
                        keyword,
                        baseElement.rowIndex
                    )
                );
            }
        }

        return reviewComments;
    }

    _reviewLinesOrder(file, keyword, baseArray, unchangedRows) {
        let reviewComments = [];

        const firstElement = baseArray[0];

        let previousRowIndex = firstElement.rowIndex;

        let group = [firstElement];

        let isEndOfGroup = false;

        for (let index = 1; index < baseArray.length; index++) {
            const { rowIndex: currentRowIndex, matchedContent: content } =
                baseArray[index];

            if (previousRowIndex + 1 === currentRowIndex) {
                if (content === '<<< new line >>>') {
                    isEndOfGroup = true;
                } else {
                    group.push(baseArray[index]);

                    isEndOfGroup = index === baseArray.length - 1;
                }
            } else {
                if (group.length > 1 || content === '<<< new line >>>') {
                    isEndOfGroup = true;
                }
            }

            if (isEndOfGroup && this._isValidGroup(group, 1)) {
                reviewComments.push(
                    ...this._reviewGroup(file, keyword, group, unchangedRows)
                );

                group = [baseArray[index]];
            }

            previousRowIndex = currentRowIndex;
        }

        return reviewComments;
    }

    /** checks if group consists of more than {length} elements that aren't empty spaces or deleted content */
    _isValidGroup(group, length = 0) {
        const filteredGroup = group.filter(
            (element) =>
                !['<<< new line >>>', '<<< merge >>>'].includes(
                    element.matchedContent
                )
        );

        return filteredGroup && filteredGroup.length > length;
    }

    _sortArray(keyword, array) {
        return [...array].sort(
            ({ matchedContent: element1 }, { matchedContent: element2 }) =>
                keyword.order === 'ascending'
                    ? element1.length - element2.length
                    : element2.length - element1.length
        );
    }

    /** checks if group includes unchanged row */
    _tryToGetIndexOfUnchangedRow(startFrom, group, unchangedRows) {
        let indexOfUnchangedRow = -1;

        for (let index = startFrom; index < group.length; index++) {
            const groupElement = group[index];

            if (unchangedRows.includes(groupElement.rowIndex)) {
                indexOfUnchangedRow = index;
                break;
            }
        }

        return indexOfUnchangedRow;
    }

    /** handles comment rendering depending on group structure  */
    _reviewGroup(file, keyword, group, unchangedRows) {
        let reviewComments = [];
        let indexOfUnchangedRow = 0;

        let wasUnchangedRowFound = false;

        for (let index = 0; index < group.length; index++) {
            indexOfUnchangedRow = this._tryToGetIndexOfUnchangedRow(
                indexOfUnchangedRow,
                group,
                unchangedRows
            );

            if (indexOfUnchangedRow >= 0) {
                wasUnchangedRowFound = true;

                const slicedGroup = group.slice(index, indexOfUnchangedRow + 1);

                if (
                    slicedGroup.length &&
                    !this._isGroupProperlyOrdered(keyword, group, slicedGroup)
                ) {
                    const element = slicedGroup.filter(
                        (element) =>
                            !['<<< new line >>>', '<<< merge >>>'].includes(
                                element.matchedContent
                            )
                    );

                    if (element.length === 1) {
                        reviewComments.push(
                            this._getSingleLineComment(
                                file,
                                keyword,
                                element.rowIndex
                            )
                        );
                    } else {
                        reviewComments.push(
                            this._getMultiLineComment(
                                file,
                                keyword,
                                slicedGroup
                            )
                        );
                    }
                }

                index = indexOfUnchangedRow;
                indexOfUnchangedRow++;
            } else {
                if (
                    !this._isGroupProperlyOrdered(keyword, group) &&
                    this._isValidGroup(group) &&
                    !wasUnchangedRowFound
                ) {
                    reviewComments.push(
                        this._getMultiLineComment(file, keyword, group)
                    );
                }

                break;
            }
        }

        return reviewComments;
    }

    /** checks if group is sorted as intended to keyword config  */
    _isGroupProperlyOrdered(keyword, group, slicedGroup = null) {
        let isProperlyOrdered = true;

        const sortedGroup = this._sortArray(keyword, group).filter(
            (element) =>
                !['<<< merge >>>', '<<< new line >>>'].includes(
                    element.matchedContent
                )
        );

        if (slicedGroup) {
            slicedGroup = slicedGroup.filter(
                (element) =>
                    !['<<< merge >>>', '<<< new line >>>'].includes(
                        element.matchedContent
                    )
            );

            const indexOfFirstOccurence = sortedGroup.findIndex(
                (element) => element.rowIndex === slicedGroup[0].rowIndex
            );

            if (indexOfFirstOccurence >= 0) {
                for (
                    let sortedGroupIndex = indexOfFirstOccurence,
                        slicedGroupIndex = 0;
                    sortedGroupIndex <
                    indexOfFirstOccurence + slicedGroup.length;
                    sortedGroupIndex++, slicedGroupIndex++
                ) {
                    if (
                        slicedGroup[slicedGroupIndex].rowIndex !==
                        sortedGroup[sortedGroupIndex].rowIndex
                    ) {
                        isProperlyOrdered = false;
                        break;
                    }
                }
            }
        } else {
            for (let index = 0; index < group.length; index++) {
                if (group[index].rowIndex !== sortedGroup[index].rowIndex) {
                    isProperlyOrdered = false;

                    break;
                }
            }
        }

        return isProperlyOrdered;
    }

    _getSingleLineComment(file, keyword, rowIndex) {
        const { split_patch: splitPatch } = file;

        const line = getLineNumber(splitPatch, 'right', rowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildSingleLineComment({
            body: this._getCommentBody(keyword),
            line,
            side: 'RIGHT',
        });

        return comment;
    }

    _getMultiLineComment(file, keyword, group) {
        const { rowIndex: firstRowIndex } = group.find(
            (element) => element.matchedContent !== '<<< new line >>>'
        );

        const { rowIndex: lastRowIndex } = group
            .reverse()
            .find(
                (element) =>
                    !['<<< new line >>>', '<<< merge >>>'].includes(
                        element.matchedContent
                    )
            );

        const { split_patch: splitPatch } = file;

        const start_line = getLineNumber(splitPatch, 'right', firstRowIndex);

        const position = getPosition(splitPatch, lastRowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildMultiLineComment({
            body: this._getCommentBody(keyword),
            start_line,
            start_side: 'RIGHT',
            position,
        });

        return comment;
    }

    _getCommentBody(keyword) {
        const commentBody = `Keep \`${keyword.order}\` order for keyword: \`${keyword.name}\``;

        return dedent(commentBody);
    }
}

module.exports = KeywordsOrderedByLengthRule;
