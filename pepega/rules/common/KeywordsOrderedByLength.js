const BaseRule = require('../Base');
const dedent = require('dedent-js');
const getPosition = require('../../helpers/getPosition');
const getLineNumber = require('../../helpers/getLineNumber');
const ReviewCommentBuilder = require('../../builders/ReviewComment');

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

    _reviewLinesOrderIgnoringNewline(file, keyword, baseArray) {
        let reviewComments = [];

        const sortedArray = this._sortArray(keyword, baseArray);

        for (
            let baseArrayIndex = 0, sortedArrayIndex = 0;
            baseArrayIndex < sortedArray.length;
            baseArrayIndex++
        ) {
            const baseElement = baseArray[baseArrayIndex];

            if (this._hasCode(baseElement)) {
                for (
                    ;
                    sortedArrayIndex < sortedArray.length;
                    sortedArrayIndex++
                ) {
                    const sortedElement = sortedArray[sortedArrayIndex];

                    if (baseElement.index === sortedElement.index) {
                        sortedArrayIndex++;

                        break;
                    }

                    if (
                        this._hasCode(sortedElement) &&
                        baseElement.index !== sortedElement.index
                    ) {
                        const body = this._getCommentBody(keyword);

                        reviewComments.push(
                            this.getSingleLineComment(
                                file,
                                body,
                                baseElement.index
                            )
                        );

                        sortedArrayIndex++;

                        break;
                    }
                }
            }
        }

        return reviewComments;
    }

    _reviewLinesOrder(file, keyword, baseArray, unchangedRows) {
        let reviewComments = [];

        const firstElement = baseArray[0];

        let previousIndex = firstElement.index;

        let group = [firstElement];

        let isEndOfGroup = false;

        for (let index = 1; index < baseArray.length; index++) {
            const { index: currentIndex, content } = baseArray[index];

            if (previousIndex + 1 === currentIndex) {
                if (content === this.newLine) {
                    isEndOfGroup = true;
                } else {
                    group.push(baseArray[index]);

                    isEndOfGroup = index === baseArray.length - 1;
                }
            } else {
                if (group.length > 1 || content === this.newLine) {
                    isEndOfGroup = true;
                }
            }

            if (isEndOfGroup && this._isValidGroup(group, 1)) {
                reviewComments.push(
                    ...this._reviewGroup(file, keyword, group, unchangedRows)
                );

                while (this.customLines.includes(baseArray[index].content)) {
                    index++;
                }

                group = [baseArray[index]];
            }

            previousIndex = currentIndex;
        }

        return reviewComments;
    }

    /** checks if group consists of more than {length} elements that aren't empty spaces or deleted content */
    _isValidGroup(group, length = 0) {
        const filteredGroup = group.filter((element) => this._hasCode(element));

        return filteredGroup && filteredGroup.length > length;
    }

    _sortArray(keyword, array) {
        return [...array].sort(({ content: element1 }, { content: element2 }) =>
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

            if (
                unchangedRows.some(
                    (unchangedRow) => unchangedRow.index === groupElement.index
                )
            ) {
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
                    slicedGroup?.length &&
                    !this._isSlicedGroupProperlyOrdered(
                        keyword,
                        group,
                        slicedGroup
                    )
                ) {
                    const element = slicedGroup.filter((element) =>
                        this._hasCode(element)
                    );

                    if (element.length === 1) {
                        const body = this._getCommentBody(keyword);

                        reviewComments.push(
                            this.getSingleLineComment(file, body, element.index)
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

    /** checks if group is sorted according to keyword config  */
    _isGroupProperlyOrdered(keyword, group) {
        let isProperlyOrdered = true;

        const sortedGroup = this._sortArray(keyword, group).filter((element) =>
            this._hasCode(element)
        );

        for (let index = 0; index < group.length; index++) {
            if (group[index].index !== sortedGroup[index].index) {
                isProperlyOrdered = false;

                break;
            }
        }

        return isProperlyOrdered;
    }

    /** checks if sliced group is sorted as intended according to keyword config and part of group array */
    _isSlicedGroupProperlyOrdered(keyword, group, slicedGroup) {
        let isProperlyOrdered = true;

        const sortedGroup = this._sortArray(keyword, group).filter((element) =>
            this._hasCode(element)
        );

        slicedGroup = slicedGroup.filter((element) => this._hasCode(element));

        const indexOfFirstOccurence = sortedGroup.findIndex(
            (element) => element.index === slicedGroup[0].index
        );

        if (indexOfFirstOccurence >= 0) {
            for (
                let sortedGroupIndex = indexOfFirstOccurence,
                    slicedGroupIndex = 0;
                sortedGroupIndex < indexOfFirstOccurence + slicedGroup.length;
                sortedGroupIndex++, slicedGroupIndex++
            ) {
                if (
                    slicedGroup[slicedGroupIndex].index !==
                    sortedGroup[sortedGroupIndex].index
                ) {
                    isProperlyOrdered = false;
                    break;
                }
            }
        }

        return isProperlyOrdered;
    }

    _getMultiLineComment(file, keyword, group) {
        const { index: firstIndex } = group.find(
            (element) => element.content !== this.newLine
        );

        const { index: lastIndex } = group
            .reverse()
            .find((element) => this._hasCode(element));

        const { split_patch: splitPatch } = file;

        const start_line = getLineNumber(splitPatch, 'right', firstIndex);

        const position = getPosition(splitPatch, lastIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildMultiLineComment({
            body: this._getCommentBody(keyword),
            start_line,
            start_side: 'RIGHT',
            position,
        });

        return comment;
    }

    _hasCode(element) {
        return !this.customLines.includes(element.content);
    }

    _getCommentBody(keyword) {
        const commentBody = `Keep \`${keyword.order}\` order for keyword: \`${keyword.name}\``;

        return dedent(commentBody);
    }
}

module.exports = KeywordsOrderedByLengthRule;
