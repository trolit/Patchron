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
     * @param {boolean} config.keywords[].enforced - if **true**, forces to count first matched keyword occurence as expected position when primary one was not found in given file's patch
     * @param {boolean} config.keywords[].breakOnFirstOccurence - when **true**, stops keyword review on first invalid occurence
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
            probotInstance.log.error(
                `Couldn't run rule ${__filename} on ${file.filename}. No keywords defined.`
            );

            return [];
        }

        const { split_patch: splitPatch } = file;
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
                    const multilineEndIndex = this.resolveMultilineMatch(
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
        }

        if (index === -1) {
            return null;
        }

        return {
            index,
            wasEnforced,
        };
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

    _reviewPosition(file, matchedData, keyword, position) {
        const { breakOnFirstOccurence, maxLineBreaks } = keyword;
        const { index: positionIndex, wasEnforced } = position;

        let recentRowIndex = positionIndex;
        let reviewComments = [];

        for (
            let index = wasEnforced ? 1 : 0;
            index < matchedData.length;
            index++
        ) {
            const row = matchedData[index];
            let isValid = false;
            let distance = 0;

            if (row?.length) {
                distance = recentRowIndex - row.length - row.index;
            } else {
                distance = recentRowIndex - row.index - 1;
            }

            if (!maxLineBreaks) {
                isValid = distance === 0;
            } else {
                isValid = distance <= maxLineBreaks;
            }

            if (!isValid) {
                reviewComments.push(
                    this.getMultiLineComment({
                        file,
                        body: this._getCommentBody(keyword, wasEnforced),
                        from: recentRowIndex,
                        to: row.index,
                    })
                );
            }

            recentRowIndex = row.index;

            if (breakOnFirstOccurence) {
                break;
            }
        }

        return reviewComments;
    }

    _reviewEOF(file, matchedData, keyword, position) {
        const { breakOnFirstOccurence, maxLineBreaks } = keyword;
        const { index: positionIndex, wasEnforced } = position;

        let recentRowIndex = positionIndex;
        let reviewComments = [];

        console.table(file.split_patch);

        for (
            let index = wasEnforced
                ? matchedData.length - 2
                : matchedData.length - 1;
            index >= 0;
            index--
        ) {
            const row = matchedData[index];

            console.log('---comparing---');
            console.log(row);
            console.log(recentRowIndex);

            let isValid = false;
            let distance = 0;

            if (row?.length) {
                distance = recentRowIndex - row.length - row.index;
            } else {
                distance = recentRowIndex - row.index - 1;
            }

            if (!maxLineBreaks) {
                isValid = distance === 0;
            } else {
                isValid = distance <= maxLineBreaks;
            }

            if (!isValid) {
                reviewComments.push(
                    this.getMultiLineComment({
                        file,
                        body: this._getCommentBody(keyword, wasEnforced),
                        from: row.index,
                        to: recentRowIndex,
                    })
                );
            }

            recentRowIndex = row.index;

            if (breakOnFirstOccurence) {
                break;
            }
        }

        return reviewComments;
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
            const dataLength = this.countPatchLength(splitPatch);
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

        // if line is multiline
        console.table(data);

        if (data[index]?.length) {
            console.log('koko');

            const length = data[index]?.length;

            index = EOF ? index - length : index + length;
        }

        console.log('was enforced? -> ', wasEnforced);

        return {
            index,
            wasEnforced,
        };
    }

    _correctIndex(data, currentIndex, testedKeyword, otherKeywords) {
        const { BOF } = testedKeyword.position;
        const { maxLineBreaks } = testedKeyword;

        for (
            let index = currentIndex, lineBreakCounter = 0;
            BOF ? index < data.length : index > 0;
            BOF ? index++ : index--
        ) {
            const { content } = data[index];

            if (content === this.merge) {
                continue;
            }

            if (content === this.newLine) {
                lineBreakCounter++;
            }

            if (lineBreakCounter > maxLineBreaks) {
                return index;
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

    countPatchLength(patch) {
        const value = patch.filter(
            (row) => !row.startsWith('-') && !row.startsWith('@@')
        );

        return value?.length || 0;
    }

    _getCommentBody(keyword, wasPositionEnforced) {}

    _getCommentBody(keyword, data) {
        const { cause, position: lineNumber, enforced } = data;

        const {
            name: keywordName,
            position: keywordPosition,
            maxLineBreaks,
        } = keyword;

        let reason = '++ undefined ++';

        switch (cause) {
            case 'noLineBreaks':
                reason = `There should not be any line breaks`;

                break;

            case 'maxLineBreaks':
                reason = `\`${keywordName}\` exceeded allowed spacing (${maxLineBreaks}) in relation to line: \`${lineNumber}\` ${
                    enforced ? `(enforced)` : ``
                }`;

                break;

            case 'position':
                if (keywordPosition.custom) {
                    reason = `\`${keywordName}\` should appear under line: \`${lineNumber}\` ${
                        enforced ? '(enforced)' : ''
                    }`;
                } else {
                    reason = `\`${keywordName}\` should appear ${
                        enforced
                            ? `below line:\`${lineNumber}\` (enforced)`
                            : `at ${
                                  keywordPosition.BOF
                                      ? `beginning (below line:\`${lineNumber}\`)`
                                      : `end (under line:\`${lineNumber}\`)`
                              } of file`
                    }`;
                }

                break;
        }

        const commentBodyWithExplanation = `${reason} 
         
        <details>
            <summary> What enforced means? </summary> \n\n<em>When keyword has \`enforced\` flag enabled, it basically means that when pull requested file does not have expected position that was provided within configuration, but it has at least two keywords, first occurence will be counted as expected position, which means, remaining ones must be positioned in relation to first one.</em> 
        </details>`;

        return enforced ? dedent(commentBodyWithExplanation) : dedent(reason);
    }
}

module.exports = PositionedKeywordsRule;
