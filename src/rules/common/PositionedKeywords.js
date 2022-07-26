const BaseRule = require('src/rules/Base');

// TODO: could use rework 🤔
class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {PositionedKeywordsConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke() {
        const keywords = this.keywords;

        if (!keywords.length) {
            this.log.warning(__filename, 'No keywords defined', this.file);

            return [];
        }

        const { splitPatch } = this.file;
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

            if (!matchResult) {
                continue;
            }

            const matchedContent = matchResult[0];

            if (keyword?.multiLineOptions) {
                const { multiLineOptions } = keyword;

                const multiLineStructure = this.helpers.getMultiLineStructure(
                    data,
                    index,
                    multiLineOptions
                );

                const { isMultiLine } = multiLineStructure;

                if (isMultiLine && ~multiLineStructure.endIndex) {
                    const { endIndex } = multiLineStructure;

                    const multiLineContent = this.convertMultiLineToSingleLine(
                        data,
                        index,
                        endIndex
                    );

                    matchedData.push({
                        index,
                        content: multiLineContent,
                        length: endIndex - index
                    });

                    index = endIndex;

                    continue;
                }
            }

            matchedData.push({
                index,
                content: matchedContent
            });
        }

        return matchedData;
    }

    _reviewFirstLayer(parameters) {
        const { data, keyword, keywords, matchedData } = parameters;
        let reviewComments = [];

        const { position: keywordPosition } = keyword;
        let position = null;

        if (keywordPosition.BOF) {
            const keywordsWithBOF = keywords.filter(
                (element) =>
                    element.position.BOF && element.regex !== keyword.regex
            );

            position = this._findBOFPosition({
                data,
                keyword,
                matchedData,
                keywordsWithBOF
            });

            if (position && !position?.wasEnforced && !position?.isMatched) {
                reviewComments = [
                    this._getWrongPositionComment(keyword, position)
                ];

                this._removeKeywords(keywords, keywordsWithBOF);

                return reviewComments;
            }
        } else if (keywordPosition?.custom) {
            position = this._findCustomPosition(data, keyword);
        }

        if (!position) {
            return null;
        }

        reviewComments = this._reviewPosition({
            data,
            keyword,
            position,
            matchedData
        });

        return reviewComments;
    }

    _reviewSecondLayer(parameters) {
        const { matchedData, keyword } = parameters;
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

        if (keyword?.multiLineOptions) {
            const { multiLineOptions } = keyword;

            const multiLineStructure = this.helpers.getMultiLineStructure(
                data,
                index,
                multiLineOptions
            );

            const { isMultiLine } = multiLineStructure;

            if (isMultiLine && ~multiLineStructure.endIndex) {
                const { endIndex } = multiLineStructure;

                length = endIndex - index;
            }
        }

        return {
            index,
            wasEnforced,
            length
        };
    }

    _findBOFPosition(parameters) {
        const { data, matchedData, keyword, keywordsWithBOF } = parameters;
        const { splitPatch } = this.file;

        let index = -1;
        let wasEnforced = false;
        const topHunkHeader = this.helpers.getNearestHunkHeader(splitPatch, 0);

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

        // skip merge/commented lines
        for (; ; index++) {
            const { trimmedContent } = data[index];

            if (![this.MERGE, this.COMMENTED_LINE].includes(trimmedContent)) {
                break;
            }
        }

        let length = null;

        if (keyword?.multiLineOptions) {
            const { multiLineOptions } = keyword;

            const multiLineStructure = this.helpers.getMultiLineStructure(
                data,
                index,
                multiLineOptions
            );

            const { isMultiLine } = multiLineStructure;

            if (isMultiLine && ~multiLineStructure.endIndex) {
                const { endIndex } = multiLineStructure;

                length = endIndex - index;
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
     * @param {{ data: Array<object>, matchedData: Array<object>, keyword: object, position: object }} parameters
     */
    _reviewPosition(parameters) {
        const { data, matchedData, keyword, position } = parameters;

        const {
            maxLineBreaks,
            breakOnFirstOccurence,
            countDifferentCodeAsLineBreak
        } = keyword;

        const matchedDataLength = matchedData.length;

        let recentRow = position;
        const reviewComments = [];

        for (let index = 1; index < matchedDataLength; index++) {
            const row = matchedData[index];

            let distance = 0;
            let isValid = false;
            let reason = 'tooManyLineBreaks';

            let currentIndex = row.index;
            let previousIndex = recentRow.index;

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
                        body: this._getCommentBody(
                            keyword,
                            this.file.splitPatch,
                            {
                                from,
                                to,
                                distance,
                                reason
                            }
                        ),
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

    _getWrongPositionComment(keyword, position) {
        const { rawContent, index } = position;

        const body = this
            .dedent(`Expected \`${keyword.name}\` lines to start here but found
                \`\`\`
                ${rawContent}
                \`\`\`
                `);

        return this.getSingleLineComment({
            body,
            index
        });
    }

    _getWrongOrderComment(keyword, testedRow, foundRow) {
        const { index: testedRowIndex } = testedRow;
        const { splitPatch } = this.file;

        const expectedOrder = keyword.order
            .map(({ name }) => name)
            .join(' >> ');

        const { order } = keyword;
        const testedRowLineNumber = this.helpers.getLineNumber(
            splitPatch,
            this.RIGHT,
            testedRow.index
        );
        const { name: testedRowOrder } = order[testedRow.orderIndex];

        const foundRowLineNumber = this.helpers.getLineNumber(
            splitPatch,
            this.RIGHT,
            foundRow.index
        );
        const { name: foundRowOrder } = order[foundRow.orderIndex];

        const body = this.dedent(`
               Line ${testedRowLineNumber} (${testedRowOrder}) should appear before line ${foundRowLineNumber} (${foundRowOrder})
                ----
                Expected order: 
                ${expectedOrder}
                `);

        return this.getSingleLineComment({
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

        const fromLineNumber = this.helpers.getLineNumber(
            splitPatch,
            this.RIGHT,
            from
        );
        const toLineNumber = this.helpers.getLineNumber(
            splitPatch,
            this.RIGHT,
            to
        );

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

        return this.dedent(commentBody);
    }
}

module.exports = PositionedKeywordsRule;
