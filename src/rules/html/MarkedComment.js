const BaseRule = require('src/rules/Base');

class MarkedCommentRule extends BaseRule {
    /**
     * ensures that in HTML comment block at least one line has to begin with one of the predefined prefixes.
     *
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { prefixes } = config;

        this.prefixes = prefixes;
        this.COMMENT_END = '-->';
        this.COMMENT_START = '<!--';
    }

    invoke() {
        const reviewComments = [];

        const { splitPatch } = this.file;
        const splitPatchLength = splitPatch.length;

        for (let index = 0; index < splitPatchLength; index++) {
            const row = splitPatch[index];

            if (row.startsWith(this.DELETED)) {
                continue;
            }

            const rawRow = this.getRawContent(row).trim();

            if (
                rawRow.startsWith('@@') ||
                !rawRow.includes(this.COMMENT_START)
            ) {
                continue;
            }

            if (rawRow.endsWith(this.COMMENT_END)) {
                const splitRawRow = rawRow.split(this.COMMENT_START);
                const comment =
                    splitRawRow.length === 2 ? splitRawRow[1].trim() : null;

                if (comment && !this._startsWithPrefix(comment)) {
                    reviewComments.push(
                        this.getSingleLineComment({
                            body: this._getCommentBody(),
                            index
                        })
                    );
                }

                continue;
            }

            const endIndex = this._resolveMultiLineComment(splitPatch, index);

            if (~endIndex) {
                reviewComments.push(
                    this.getMultiLineComment({
                        body: this._getCommentBody(true),
                        from: index,
                        to: endIndex
                    })
                );
            }
        }
        return reviewComments;
    }

    _resolveMultiLineComment(splitPatch, currentIndex) {
        const splitPatchLength = splitPatch.length;

        for (let index = currentIndex; index < splitPatchLength; index++) {
            const row = splitPatch[index];

            if (row.startsWith(this.DELETED)) {
                continue;
            }

            const rawRow = this.getRawContent(row).trim();

            const fixedRow = rawRow.startsWith(this.COMMENT_START)
                ? rawRow.slice(4).trim()
                : rawRow;

            if (this._startsWithPrefix(fixedRow)) {
                break;
            }

            if (fixedRow.endsWith(this.COMMENT_END)) {
                return index;
            }
        }

        return -1;
    }

    _startsWithPrefix(row) {
        return this.prefixes.some(({ value }) => row.startsWith(value));
    }

    /**
     * @returns {string}
     */
    _getCommentBody(isMultiLine = false) {
        let formattedPrefixes = '';

        this.prefixes.forEach((prefix) => {
            formattedPrefixes = `${formattedPrefixes}
            - \` ${prefix.value} \` (${prefix.meaning})`;
        });

        const start = isMultiLine
            ? 'At least one line of comment block'
            : 'Comment';

        const commentBody = `${start} should start with one of the predefined prefixes.
         
        <details>
            <summary> List of allowed prefixes </summary> \n\n${this.dedent(
                formattedPrefixes
            )}
        </details>`;

        return this.dedent(commentBody);
    }
}

module.exports = MarkedCommentRule;
