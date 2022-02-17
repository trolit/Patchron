const BaseRule = require('../Base');

const merge = '<<< merge >>>';
const newLine = '<<< new line >>>';
const customLines = [newLine, merge];

class KeywordsOrderedByLengthRule extends BaseRule {
    /**
     * **Important:** configure each keyword with **only** one way of finding position (custom regex, BOF or EOF).
     * Rule is tested against **patch** which means that if you set e.g. BOF and reviewed file won't contain first
     * line, review will be skipped since patch simply does not contain beginning of pull requested file.
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { regex: object, direction: 'up'|'down' }, BOF: boolean, EOF: boolean, ignoreNewline: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * @param {object} config.keywords[].position - **[option 1]**
     * defines keyword expected position via custom regex and direction (up/down)
     * @param {object} config.keywords[].position.regex - matches position via regex
     * @param {object} config.keywords[].position.direction - whether lines should be positioned above or below position matched via regex
     * @param {boolean} config.keywords[].BOF - **[option 2]**
     * when set to true, beginning of file is claimed position
     * @param {boolean} config.keywords[].EOF - **[option 3]**
     * when set to true, end of file is keyword's position
     * @param {boolean} config.keywords[].ignoreNewline - when true, spaces between matched line(s) are not counted as rule break
     *
     * @example
     * ```js
     * {
     *    name: '',
     *    regex: //,
     *    position: null,
     *    BOF: true,
     *    EOF: false,
     *    ignoreNewline: false
     * }
     * ```
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
            if (!this._hasKeywordValidConfig(keyword)) {
                probotInstance.log.error(
                    `Keyword ${keyword} skipped due to invalid config - ${__filename}.`
                );

                continue;
            }

            if (keyword.position !== null) {
                // handle custom regex positioning
            }

            if (keyword.BOF) {
                // handle BOF positioning
                // check if patch hunk header starts from BOF
            }

            if (keyword.EOF) {
                // handle EOF positioning
                // check if patch hunk header ends on EOF
            }

            // const matchResult = rowContent.match(keyword.locationRegex);

            const indexOfLocationLine = this._getPositionIndex(
                splitPatch,
                keyword
            );

            if (indexOfLocationLine < 0) {
                continue;
            }

            if (['start', 'end'].includes(keyword.appearance)) {
            }

            if (['after', 'before'].includes(keyword.appearance)) {
            }

            const { matchedRows, unchangedRows } = this._setupData(
                splitPatch,
                keyword
            );

            if (matchedRows.length <= 1) {
                continue;
            }
        }

        return reviewComments;
    }

    _hasKeywordValidConfig(keyword) {
        const isPositionSet = !!keyword.position;

        const { BOF, EOF } = keyword;

        return [isPositionSet, BOF, EOF].filter((value) => value).length === 1;
    }

    _getPositionIndex(splitPatch, keyword) {
        return splitPatch.findIndex((row) => row.match(keyword.locationRegex));
    }

    _setupData(splitPatch, keyword) {
        let matchedRows = [];
        let unchangedRows = [];

        for (let rowIndex = 0; rowIndex < splitPatch.length; rowIndex++) {
            const rowContent = splitPatch[rowIndex];

            if (rowContent.trim().length === 0 || rowContent === '+') {
                matchedRows.push({
                    rowIndex,
                    matchedContent: newLine,
                });

                continue;
            } else if (rowContent.startsWith('-')) {
                matchedRows.push({
                    rowIndex,
                    matchedContent: merge,
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
}

module.exports = KeywordsOrderedByLengthRule;
