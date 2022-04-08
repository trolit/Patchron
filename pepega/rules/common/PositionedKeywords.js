const dedent = require('dedent-js');
const BaseRule = require('../Base');
const getLineNumber = require('../../helpers/getLineNumber');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { custom: { name: string, expression: string|object }, BOF: boolean }, ignoreNewline: boolean, enforced: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * @param {Array<string>} config.keywords[].multilineOptions - if none of them will be included in matched line, line will be treated as multiline.
     * @param {object} config.keywords[].position - defines keyword expected position (custom or BOF). Configure each keyword with **only** one way of determining position.
     * @param {number} config.keywords[].maxLineBreaks - defines maximum allowed line breaks between each keyword. When 0, spaces between matched line(s) are counted as rule break
     * @param {boolean} config.keywords[].enforced - when **enabled**, it basically means that when patch does not have expected position that was provided within configuration - but it has at least two keywords - first occurence will be counted as expected position, which means, remaining ones must be positioned in relation to first one.
     * @param {boolean} config.keywords[].breakOnFirstOccurence - when **true**, stops keyword review on first invalid occurence
     * @param {boolean} config.keywords[].countDifferentCodeAsLineBreak - when **disabled**, code other than line break (\n), found between matched keywords is counted as rule break.
     */
    constructor(config) {
        super();

        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke(file) {
        const keywords = this.keywords;

        if (!keywords.length) {
            this.logError(__filename, file, 'No keywords defined');

            return [];
        }

        const { split_patch: splitPatch } = file;

        if (!splitPatch) {
            this.logError(__filename, file, 'Empty patch');

            return [];
        }

        const data = this._setupData(splitPatch);

        let reviewComments = [];

        for (const keyword of keywords) {
            if (!this._hasKeywordValidConfig(keyword)) {
                this.logError(
                    __filename,
                    file,
                    'Keyword review skipped due to invalid position config'
                );

                continue;
            }

            const matchedData = this._matchKeywordData(
                splitPatch,
                data,
                keyword
            );

            if (matchedData.length <= 1) {
                continue;
            }

            const { position: keywordPosition } = keyword;
            let position = null;

            if (keywordPosition.custom !== null) {
                position = this._findCustomPosition(splitPatch, keyword);
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
                    keywordsWithBOF,
                });

                const { wasEnforced, isMatched } = position;

                if (!wasEnforced && !isMatched && position) {
                    reviewComments.push(
                        this._getWrongPositionComment(file, keyword, position)
                    );

                    continue;
                }
            }

            if (!position) {
                continue;
            }

            reviewComments.push(
                ...this._reviewPosition({
                    file,
                    data,
                    keyword,
                    position,
                    matchedData,
                })
            );
        }

        return reviewComments;
    }

    _hasKeywordValidConfig(keyword) {
        const isCustomPosition = !!keyword.position.custom;
        const { BOF } = keyword.position;

        return [isCustomPosition, BOF].filter((value) => value).length === 1;
    }

    _setupData(splitPatch) {
        let data = [];

        for (let index = 0; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (['+', ''].includes(removeWhitespaces(row))) {
                data.push({
                    index,
                    content: this.newLine,
                });

                continue;
            }

            if (row.startsWith('-')) {
                data.push({
                    index,
                    content: this.merge,
                });

                continue;
            }

            const rawRow = this.getRawContent(row);

            data.push({
                index,
                content: rawRow,
            });
        }

        return data;
    }

    _matchKeywordData(splitPatch, data, keyword) {
        let matchedData = [];

        for (let index = 0; index < data.length; index++) {
            const matchResult = data[index].content.match(keyword.regex);

            if (matchResult) {
                const content = matchResult[0];

                const isMultiLine =
                    keyword?.multilineOptions?.length &&
                    this.isMultiline(keyword, content);

                if (isMultiLine) {
                    const multilineEndIndex = this.getMultiLineEndIndex(
                        keyword,
                        splitPatch,
                        index
                    );

                    const rawContent = this.getRawContent(
                        splitPatch[multilineEndIndex]
                    );

                    matchedData.push({
                        index,
                        content: rawContent,
                        length: multilineEndIndex - index,
                    });

                    index = multilineEndIndex;
                } else {
                    matchedData.push({
                        index,
                        content: content,
                    });
                }
            }
        }

        return matchedData;
    }

    _findCustomPosition(splitPatch, keyword) {
        let wasEnforced = false;
        let index = -1;

        const { expression } = keyword.position.custom;

        index = splitPatch.findIndex((row) =>
            typeof expression === 'object'
                ? row.match(expression)
                : row.includes(expression)
        );

        if (index === -1 && keyword.enforced) {
            index = splitPatch.findIndex((row) => row.match(keyword.regex));

            wasEnforced = true;
        } else if (index === -1) {
            return null;
        } else {
            index++;
        }

        let length = null;

        if (this.isMultiline(keyword, splitPatch[index])) {
            const multilineEndIndex = this.getMultiLineEndIndex(
                keyword,
                splitPatch,
                index
            );

            length = multilineEndIndex - index;
        }

        return {
            index,
            wasEnforced,
            length,
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
            const { content } = data[index];

            if (content !== this.merge) {
                break;
            }
        }

        let length = null;

        if (keyword.multilineOptions?.length) {
            const isMultiLine = this.isMultiline(
                keyword,
                data[index].content,
                'bottom'
            );

            if (isMultiLine) {
                const multilineEndIndex = this.getMultiLineEndIndex(
                    keyword,
                    splitPatch,
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
            isMatched: !!rawContent.match(keyword.regex),
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
            countDifferentCodeAsLineBreak,
        } = keyword;

        const { split_patch: splitPatch } = file;

        let recentRow = position;
        let reviewComments = [];

        for (let index = 1; index < matchedData.length; index++) {
            let reason = 'tooManyLineBreaks';
            const row = matchedData[index];

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
                    splitPatch,
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
                            reason,
                        }),
                        from,
                        to,
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
            index,
        });
    }

    _getMultiLineStartIndex(splitPatch, keyword, endIndex) {
        let startIndex = -1;

        for (let index = endIndex - 1; index >= 0; index--) {
            const content = splitPatch[index];

            if (content.match(keyword.regex)) {
                startIndex = index;

                break;
            }
        }

        return startIndex;
    }

    _reduceDistanceFromMergeLines(data, startIndex, endIndex) {
        let toReduce = 0;

        for (let index = startIndex + 1; index < endIndex; index++) {
            const { content } = data[index];

            if (content === this.merge) {
                toReduce++;
            }
        }

        return toReduce;
    }

    _includesDifferentCode(splitPatch, from, to) {
        let result = false;

        for (let index = from + 1; index < to; index++) {
            const content = splitPatch[index];

            if (content.startsWith('-')) {
                continue;
            }

            if (!this.isNewLine(content)) {
                result = true;
            }
        }

        return result;
    }

    _correctIndex(data, currentIndex, otherKeywords) {
        for (let index = currentIndex; index < data.length; index++) {
            const { content } = data[index];

            if (this.customLines.includes(content)) {
                continue;
            }

            const isMatched = otherKeywords.some((otherKeyword) =>
                content.match(otherKeyword.regex)
            );

            if (!isMatched) {
                return index;
            }
        }

        return currentIndex;
    }

    _countPatchLength(patch) {
        const value = patch.filter(
            (row) => !row.startsWith('-') && !row.startsWith('@@')
        );

        return value?.length || 0;
    }

    /**
     * @param {object} keyword
     * @param {Array<string>} splitPatch
     * @param {object} review
     */
    _getCommentBody(keyword, splitPatch, review) {
        const { from, to, distance, reason } = review;
        const { maxLineBreaks, name } = keyword;

        const fromLineNumber = getLineNumber(splitPatch, 'RIGHT', from);
        const toLineNumber = getLineNumber(splitPatch, 'RIGHT', to);

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
