const dedent = require('dedent-js');
const BaseRule = require('../Base');
const getLineNumber = require('../../helpers/getLineNumber');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { custom: { name: string, expression: string|object }, BOF: boolean }, ignoreNewline: boolean, enforced: boolean, breakOnFirstOccurence: boolean, countDifferentCodeAsLineBreak: boolean, order: Array<{ name: string, expression: object}>}>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * @param {Array<string>} config.keywords[].multilineOptions - if none of them will be included in matched line, line will be treated as multiline.
     * @param {object} config.keywords[].position - defines keyword expected position (custom or BOF). Configure each keyword with **only** one way of determining position.
     * @param {number} config.keywords[].maxLineBreaks - defines maximum allowed line breaks between each keyword. When 0, spaces between matched line(s) are counted as rule break
     * @param {boolean} config.keywords[].enforced - when **enabled**, it basically means that when patch does not have expected position that was provided within configuration - but it has at least two keywords - first occurence will be counted as expected position, which means, remaining ones must be positioned in relation to first one.
     * @param {boolean} config.keywords[].breakOnFirstOccurence - when **true**, stops keyword review on first invalid occurence
     * @param {boolean} config.keywords[].countDifferentCodeAsLineBreak - when **disabled**, code other than line break (\n), found between matched keywords is counted as rule break.
     * @param {Array<object>} config.keywords[].order - allows to provide second layer of keyword positioning. Requires at least two objects to compare matched lines against themselves. For instance, for `import` keyword, second layer could enforce following positioning: `packages -> components -> helpers`
     */
    constructor(pepegaContext, config) {
        super(pepegaContext);

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke(file) {
        const keywords = this.keywords;

        if (!keywords.length) {
            this.log.warning(__filename, 'No keywords defined', file);

            return [];
        }

        const { split_patch: splitPatch } = file;
        const data = this.setupData(splitPatch);

        let reviewComments = [];

        for (const keyword of keywords) {
            if (!this._hasKeywordValidConfig(keyword)) {
                this.log.warning(
                    __filename,
                    `Keyword ${
                        keyword.name || 'undefined'
                    } review skipped due to invalid config`
                );

                continue;
            }

            const matchedData = this._matchKeywordData(data, keyword);

            if (matchedData.length <= 1) {
                continue;
            }

            const firstLayerReview = this._reviewFirstLayer({
                file,
                data,
                keyword,
                keywords,
                matchedData
            });

            if (!firstLayerReview) {
                continue;
            }

            reviewComments.push(...firstLayerReview);

            if (keyword.order?.length > 1) {
                const secondLayerReview = this._reviewSecondLayer({
                    file,
                    keyword,
                    matchedData
                });

                reviewComments.push(...secondLayerReview);
            }
        }

        return reviewComments;
    }

    _hasKeywordValidConfig(keyword) {
        const isCustomPosition = !!keyword.position.custom;
        const { BOF } = keyword.position;

        return [isCustomPosition, BOF].filter((value) => value).length === 1;
    }

    _matchKeywordData(data, keyword) {
        let matchedData = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const { trimmedContent } = data[index];
            const matchResult = trimmedContent.match(keyword.regex);

            if (matchResult) {
                const matchedContent = matchResult[0];

                const isMultiLine =
                    keyword?.multilineOptions?.length &&
                    this.isPartOfMultiLine(keyword, matchedContent);

                if (isMultiLine) {
                    const multiLineEndIndex = this.getMultiLineEndIndex(
                        data,
                        keyword,
                        index
                    );

                    const multiLineContent = this.convertMultiLineToSingleLine(
                        data,
                        index,
                        multiLineEndIndex
                    );

                    matchedData.push({
                        index,
                        content: multiLineContent,
                        length: multiLineEndIndex - index
                    });

                    index = multiLineEndIndex;
                } else {
                    matchedData.push({
                        index,
                        content: matchedContent
                    });
                }
            }
        }

        return matchedData;
    }

    _reviewFirstLayer(parameters) {
        const { file, data, keyword, keywords, matchedData } = parameters;
        const { split_patch: splitPatch } = file;
        let reviewComments = [];

        const { position: keywordPosition } = keyword;
        let position = null;

        if (keywordPosition.custom !== null) {
            position = this._findCustomPosition(data, keyword);
        }

        if (keywordPosition.BOF) {
            const keywordsWithBOF = keywords.filter(
                (element) =>
                    element.position.BOF && element.regex !== keyword.regex
            );

            position = this._findBOFPosition({
                data,
                keyword,
                splitPatch,
                matchedData,
                keywordsWithBOF
            });

            if (position && !position?.wasEnforced && !position?.isMatched) {
                reviewComments = [
                    this._getWrongPositionComment(file, keyword, position)
                ];

                this._removeKeywords(keywords, keywordsWithBOF);

                return reviewComments;
            }
        }

        if (!position) {
            return null;
        }

        reviewComments = this._reviewPosition({
            file,
            data,
            keyword,
            position,
            matchedData
        });

        return reviewComments;
    }

    _reviewSecondLayer(parameters) {
        const { file, matchedData, keyword } = parameters;
        const { order } = keyword;
        let reviewComments = [];

        for (const row of matchedData) {
            const { content } = row;

            const orderIndex = order.findIndex(({ expression }) =>
                content.match(expression)
            );

            row.orderIndex = orderIndex;
        }

        const matchedDataLength = matchedData.length;

        for (let index = 1; index < matchedDataLength; index++) {
            const row = matchedData[index];

            const rowWithGreaterOrderIndex = matchedData.find(
                ({ orderIndex }) => orderIndex > row.orderIndex
            );

            if (
                rowWithGreaterOrderIndex &&
                rowWithGreaterOrderIndex.index < row.index
            ) {
                reviewComments.push(
                    this._getWrongOrderComment(
                        keyword,
                        file,
                        row,
                        rowWithGreaterOrderIndex
                    )
                );
            }
        }

        return reviewComments;
    }

    _findCustomPosition(data, keyword) {
        let wasEnforced = false;
        let index = -1;

        const { expression } = keyword.position.custom;

        index = data.findIndex(({ trimmedContent }) =>
            typeof expression === 'object'
                ? trimmedContent.match(expression)
                : trimmedContent.includes(expression)
        );

        if (index === -1 && keyword.enforced) {
            index = data.findIndex(({ trimmedContent }) =>
                trimmedContent.match(keyword.regex)
            );

            wasEnforced = true;
        } else if (index === -1) {
            return null;
        } else {
            index++;
        }

        let length = null;

        if (this.isPartOfMultiLine(keyword, data[index].trimmedContent)) {
            const multilineEndIndex = this.getMultiLineEndIndex(
                data,
                keyword,
                index
            );

            length = multilineEndIndex - index;
        }

        return {
            index,
            wasEnforced,
            length
        };
    }

    _findBOFPosition(parameters) {
        const { splitPatch, data, matchedData, keyword, keywordsWithBOF } =
            parameters;

        let index = -1;
        let wasEnforced = false;
        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);

        const { line } = topHunkHeader.modifiedFile;

        index = line === 1 ? 1 : -1;

        if (index === -1 && keyword.enforced) {
            index = matchedData[0].index;

            wasEnforced = true;
        }

        if (index === -1) {
            return null;
        }

        if (!wasEnforced && keywordsWithBOF?.length) {
            index = this._correctIndex(data, index, keywordsWithBOF);
        }

        // skip merge lines
        for (; ; index++) {
            const { trimmedContent } = data[index];

            if (![this.MERGE, this.COMMENTED_LINE].includes(trimmedContent)) {
                break;
            }
        }

        let length = null;

        if (keyword.multilineOptions?.length) {
            const isMultiLine = this.isPartOfMultiLine(
                keyword,
                data[index].trimmedContent
            );

            if (isMultiLine) {
                const multilineEndIndex = this.getMultiLineEndIndex(
                    data,
                    keyword,
                    index
                );

                length = multilineEndIndex - index;
            }
        }

        const rawContent = this.getRawContent(splitPatch[index]);

        return {
            index,
            length,
            rawContent,
            wasEnforced,
            isMatched: !!rawContent.match(keyword.regex)
        };
    }

    /**
     * @param {{ file: object, data: Array<object>, matchedData: Array<object>, keyword: object, position: object }} parameters
     */
    _reviewPosition(parameters) {
        const { file, data, matchedData, keyword, position } = parameters;

        const {
            breakOnFirstOccurence,
            maxLineBreaks,
            countDifferentCodeAsLineBreak
        } = keyword;

        const { split_patch: splitPatch } = file;
        const matchedDataLength = matchedData.length;

        let recentRow = position;
        let reviewComments = [];

        for (let index = 1; index < matchedDataLength; index++) {
            const row = matchedData[index];

            let reason = 'tooManyLineBreaks';
            let isValid = false;
            let distance = 0;

            let previousIndex = recentRow.index;
            let currentIndex = row.index;

            if (recentRow?.length) {
                previousIndex += recentRow.length;
            }

            const toReduce = this._reduceDistanceFromMergeLines(
                data,
                previousIndex,
                currentIndex
            );

            distance = currentIndex - previousIndex - 1 - toReduce;

            if (!maxLineBreaks) {
                isValid = distance === 0;
            } else {
                isValid = distance <= maxLineBreaks;
            }

            if (isValid && !countDifferentCodeAsLineBreak) {
                isValid = !this._includesDifferentCode(
                    data,
                    previousIndex,
                    currentIndex
                );

                reason = isValid ? reason : 'differentCode';
            }

            if (!isValid) {
                const from = recentRow.index;
                const to = row.index;

                reviewComments.push(
                    this.getMultiLineComment({
                        file,
                        body: this._getCommentBody(keyword, splitPatch, {
                            from,
                            to,
                            distance,
                            reason
                        }),
                        from,
                        to
                    })
                );
            }

            recentRow = row;

            if (!isValid && breakOnFirstOccurence) {
                break;
            }
        }

        return reviewComments;
    }

    _getWrongPositionComment(file, keyword, position) {
        const { rawContent, index } = position;

        const body =
            dedent(`Expected \`${keyword.name}\` lines to start here but found
                \`\`\`
                ${rawContent}
                \`\`\`
                `);

        return this.getSingleLineComment({
            file,
            body,
            index
        });
    }

    _getWrongOrderComment(keyword, file, testedRow, foundRow) {
        const { index: testedRowIndex } = testedRow;
        const { split_patch: splitPatch } = file;

        const expectedOrder = keyword.order
            .map(({ name }) => name)
            .join(' >> ');

        const { order } = keyword;
        const testedRowLineNumber = getLineNumber(
            splitPatch,
            this.RIGHT,
            testedRow.index
        );
        const { name: testedRowOrder } = order[testedRow.orderIndex];

        const foundRowLineNumber = getLineNumber(
            splitPatch,
            this.RIGHT,
            foundRow.index
        );
        const { name: foundRowOrder } = order[foundRow.orderIndex];

        const body = dedent(`
               Line ${testedRowLineNumber} (${testedRowOrder}) should appear before line ${foundRowLineNumber} (${foundRowOrder})
                ----
                Expected order: 
                ${expectedOrder}
                `);

        return this.getSingleLineComment({
            file,
            body,
            index: testedRowIndex
        });
    }

    _removeKeywords(keywords, keywordsToRemove) {
        for (const keywordToRemove of keywordsToRemove) {
            const index = keywords.findIndex(
                (keyword) => keyword === keywordToRemove
            );

            if (~index) {
                keywords.splice(index, 1);
            }
        }
    }

    _reduceDistanceFromMergeLines(data, startIndex, endIndex) {
        let toReduce = 0;

        for (let index = startIndex + 1; index < endIndex; index++) {
            const { trimmedContent } = data[index];

            if (trimmedContent === this.MERGE) {
                toReduce++;
            }
        }

        return toReduce;
    }

    _includesDifferentCode(data, from, to) {
        let result = false;

        for (let index = from + 1; index < to; index++) {
            const { trimmedContent } = data[index];

            if ([this.MERGE, this.COMMENTED_LINE].includes(trimmedContent)) {
                continue;
            }

            if (trimmedContent !== this.NEWLINE) {
                result = true;
            }
        }

        return result;
    }

    _correctIndex(data, currentIndex, otherKeywords) {
        const dataLength = data.length;

        for (let index = currentIndex; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            if (this.CUSTOM_LINES.includes(trimmedContent)) {
                continue;
            }

            const isMatched = otherKeywords.some((otherKeyword) =>
                trimmedContent.match(otherKeyword.regex)
            );

            if (!isMatched) {
                return index;
            }
        }

        return currentIndex;
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

module.exports = PositionedKeywordsRule;
