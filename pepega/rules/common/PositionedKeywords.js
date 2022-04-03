const dedent = require('dedent-js');
const BaseRule = require('../Base');
const getLineNumber = require('../../helpers/getLineNumber');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const getNearestHunkHeader = require('../../helpers/getNearestHunkHeader');

class PositionedKeywordsRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { custom: { name: string, expression: string|object }, BOF: boolean, EOF:boolean }, ignoreNewline: boolean, enforced: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * @param {Array<string>} config.keywords[].multilineOptions - if none of them will be included in matched line, line will be treated as multiline.
     * @param {object} config.keywords[].position - defines keyword expected position (custom, BOF or EOF). Configure each keyword with **only** one way of determining position.
     * @param {number} config.keywords[].maxLineBreaks - defines maximum allowed line breaks between each keyword. When 0, spaces between matched line(s) are counted as rule break
     * @param {boolean} config.keywords[].enforced - when **enabled**, it basically means that when patch does not have expected position that was provided within configuration - but it has at least two keywords - first occurence will be counted as expected position, which means, remaining ones must be positioned in relation to first one.
     * @param {boolean} config.keywords[].breakOnFirstOccurence - when **true**, stops keyword review on first invalid occurence
     * @param {boolean} config.keywords[].countDifferentCodeAsLineBreak - when **disabled**, code other than line break (\n), found between matched keywords is counted as rule break.
     */
    constructor(config) {
        super();

        const { keywords } = config;

        this.keywords = keywords;
        this.differentKeyword = '<<< different keyword >>>';
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
                probotInstance.log.warn(
                    `${__filename}\nKeyword review skipped due to invalid config (one position config per keyword).`
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

            const { position } = keyword;

            if (position.custom !== null) {
                reviewComments.push(
                    ...this._reviewCustomPosition({
                        file,
                        matchedData,
                        keyword,
                    })
                );
            }

            if (position.BOF) {
                const keywordsWithBOF = keywords.filter(
                    (element) =>
                        element.position.BOF && element.regex !== keyword.regex
                );

                reviewComments.push(
                    ...this._reviewBOFPosition({
                        file,
                        data,
                        matchedData,
                        keyword,
                        keywordsWithBOF,
                    })
                );
            }

            if (position.EOF) {
                const keywordsWithEOF = keywords.filter(
                    (element) =>
                        element.position.EOF && element.regex !== keyword.regex
                );

                reviewComments.push(
                    ...this._reviewEOFPosition({
                        file,
                        data,
                        matchedData,
                        keyword,
                        keywordsWithEOF,
                    })
                );
            }
        }

        return reviewComments;
    }

    _hasKeywordValidConfig(keyword) {
        const isCustomPosition = !!keyword.position.custom;
        const { BOF, EOF } = keyword.position;

        return (
            [isCustomPosition, BOF, EOF].filter((value) => value).length === 1
        );
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
                    keyword?.multilineOptions &&
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

    /**
     * @param {{ file: object, matchedData: Array<object>, keyword: object }} parameters
     */
    _reviewCustomPosition(parameters) {
        const { file, matchedData, keyword } = parameters;
        const { split_patch: splitPatch } = file;

        const customPosition = this._findCustomPosition(splitPatch, keyword);

        if (!customPosition) {
            return [];
        }

        return this._reviewPosition(file, matchedData, keyword, customPosition);
    }

    /**
     * @param {{ file: object, data: Array<object>, matchedData: Array<object>, keyword: object, keywordsWithBOF: Array<object> }} parameters
     */
    _reviewBOFPosition(parameters) {
        const { file, data, matchedData, keyword, keyworsWithBOF } = parameters;
        const { split_patch: splitPatch } = file;

        const position = this._findPosition(
            splitPatch,
            data,
            matchedData,
            keyword,
            keyworsWithBOF
        );

        if (!position) {
            return [];
        }

        return this._reviewPosition(file, matchedData, keyword, position);
    }

    /**
     * @param {{ file: object, data: Array<object>, matchedData: Array<object>, keyword: object, keywordsWithEOF: Array<object> }} parameters
     */
    _reviewEOFPosition(parameters) {
        const { file, data, matchedData, keyword, keywordsWithEOF } =
            parameters;

        const position = this._findPosition(
            file.split_patch,
            data,
            matchedData,
            keyword,
            keywordsWithEOF
        );

        if (!position) {
            return [];
        }

        return this._reviewEOF(file, matchedData, keyword, position);
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
        }

        if (index === -1) {
            return null;
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

    _findPosition(splitPatch, data, matchedData, testedKeyword, otherKeywords) {
        let index = -1;
        let wasEnforced = false;
        const { BOF, EOF } = testedKeyword.position;
        const topHunkHeader = getNearestHunkHeader(splitPatch, 0);

        if (BOF) {
            const { line } = topHunkHeader.modifiedFile;

            index = line === 1 ? 1 : -1;
        } else if (EOF) {
            const dataLength = this._countPatchLength(splitPatch);
            const { length: fileLength } = topHunkHeader.modifiedFile;

            index = fileLength === dataLength ? data.length - 1 : -1;
        }

        if (index === -1 && testedKeyword.enforced) {
            index = BOF
                ? matchedData[0].index
                : matchedData[matchedData.length - 1].index;

            wasEnforced = true;
        }

        if (index === -1) {
            return null;
        }

        if (!wasEnforced && otherKeywords?.length) {
            index = this._correctIndex(
                data,
                index,
                testedKeyword,
                otherKeywords
            );
        }

        // skip merge lines
        for (; ; BOF ? index++ : index--) {
            const { content } = data[index];

            if (content !== this.merge) {
                break;
            }
        }

        let length = null;
        const isMultiLine = this.isMultiline(
            testedKeyword,
            data[index].content
        );

        if (!EOF && isMultiLine) {
            const multilineEndIndex = this.getMultiLineEndIndex(
                testedKeyword,
                splitPatch,
                index
            );

            length = multilineEndIndex - index;
        } else if (EOF && isMultiLine) {
            const multiLineStartIndex = this._getMultiLineStartIndex(
                splitPatch,
                testedKeyword,
                index
            );

            length = index - multiLineStartIndex;
        }

        return {
            index,
            wasEnforced,
            length,
        };
    }

    _reviewPosition(file, matchedData, keyword, position) {
        const {
            breakOnFirstOccurence,
            maxLineBreaks,
            countDifferentCodeAsLineBreak,
        } = keyword;

        const { split_patch: splitPatch } = file;
        const { wasEnforced } = position;

        let recentRow = position;
        let reviewComments = [];

        for (
            let index = wasEnforced ? 1 : 0;
            index < matchedData.length;
            index++
        ) {
            let reason = 'tooManyLineBreaks';
            const row = matchedData[index];

            let isValid = false;
            let distance = 0;

            let previousIndex = recentRow.index;
            let currentIndex = row.index;

            if (recentRow?.length) {
                previousIndex += recentRow.length;
            }

            distance = currentIndex - previousIndex - 1;

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

            if (breakOnFirstOccurence) {
                break;
            }
        }

        return reviewComments;
    }

    _reviewEOF(file, matchedData, keyword, position) {
        const {
            breakOnFirstOccurence,
            maxLineBreaks,
            countDifferentCodeAsLineBreak,
        } = keyword;
        const { wasEnforced } = position;
        const { split_patch: splitPatch } = file;

        let recentRow = position;
        let reviewComments = [];

        for (
            let index = wasEnforced
                ? matchedData.length - 2
                : matchedData.length - 1;
            index >= 0;
            index--
        ) {
            let reason = 'tooManyLineBreaks';
            const row = matchedData[index];

            let isValid = false;
            let distance = 0;

            let previousIndex = recentRow.index;
            let currentIndex = row.index;

            if (row?.length) {
                currentIndex += row.length;
            }

            distance = previousIndex - currentIndex - 1;

            if (!maxLineBreaks) {
                isValid = distance === 0;
            } else {
                isValid = distance <= maxLineBreaks;
            }

            if (isValid && !countDifferentCodeAsLineBreak) {
                isValid = !this._includesDifferentCode(
                    splitPatch,
                    currentIndex,
                    previousIndex
                );

                reason = isValid ? reason : 'differentCode';
            }

            if (!isValid) {
                const from = row.index;
                const to = recentRow.index;

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

            if (breakOnFirstOccurence) {
                break;
            }
        }

        return reviewComments;
    }

    _getMultiLineStartIndex(splitPatch, keyword, endIndex) {
        let startIndex = -1;

        for (let index = endIndex - 1; endIndex >= 0; endIndex--) {
            const content = splitPatch[index];

            if (content.match(keyword.regex)) {
                startIndex = index;

                break;
            }
        }

        return startIndex;
    }

    _includesDifferentCode(splitPatch, from, to) {
        let result = false;

        for (let index = from + 1; index < to; index++) {
            const content = splitPatch[index];

            if (!this.isNewLine(content)) {
                result = true;
            }
        }

        return result;
    }

    _correctIndex(data, currentIndex, testedKeyword, otherKeywords) {
        const { BOF } = testedKeyword.position;

        for (
            let index = currentIndex;
            BOF ? index < data.length : index > 0;
            BOF ? index++ : index--
        ) {
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
                commentBody = `Found \`${distance}\` line(s) between \`${name}\` at lines \`${fromLineNumber}\` and \`${toLineNumber}\` but ${
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
