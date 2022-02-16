const BaseRule = require('../Base');

const merge = '<<< merge >>>';
const newLine = '<<< new line >>>';
const customLines = [newLine, merge];

// <script>
//
// export default {
//
// }
// </script>

class KeywordsOrderedByLengthRule extends BaseRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: object, position: { after: object, before: object, BOF: boolean, EOF: boolean}, allowLineBreaks: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {object} config.keywords[].regex - matches line(s) that should be validated against rule
     * @param {object} config.keywords[].position - defines keyword expected position. Set only one of provided options:
     * - **BOF** (boolean),
     * - **EOF** (boolean),
     * - **after** combined with **before** (regular expressions)
     * @param {object} config.keywords[].position.after - expression that matches start of the position
     * @param {object} config.keywords[].position.before - expression that matches end of the position
     * @param {boolean} config.keywords[].position.BOF - when set to true, beginning of file is claimed position.
     * @param {boolean} config.keywords[].position.EOF - when set to true, end of file is keyword's position.
     * @param {boolean} config.keywords[].allowLineBreaks
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
