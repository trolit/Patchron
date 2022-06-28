const BaseRule = require('src/rules/Base');

class MarkedCommentRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {MarkedCommentConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const {
            prefixes,
            isAppliedToSingleLineComments,
            isAppliedToMultiLineComments,
            isAppliedToInlineComments
        } = config;

        this.prefixes = prefixes;
        this.isAppliedToSingleLineComments = isAppliedToSingleLineComments;
        this.isAppliedToMultiLineComments = isAppliedToMultiLineComments;
        this.isAppliedToInlineComments = isAppliedToInlineComments;
    }

    invoke() {
        if (this._hasInvalidConfig()) {
            this.log.warning(__filename, 'Invalid config!', this.file);

            return [];
        }

        const unmarkedComments = [];
        const { splitPatch } = this.file;
        const splitPatchLength = splitPatch.length;

        for (let index = 0; index < splitPatchLength; index++) {
            const row = splitPatch[index];

            if (row.startsWith(this.DELETED)) {
                continue;
            }

            const rawRow = this.getRawContent(row).trim();

            if (rawRow.startsWith('@@')) {
                continue;
            }

            if (this.isAppliedToSingleLineComments && rawRow.startsWith('//')) {
                if (!this._startsWithPrefix(rawRow)) {
                    unmarkedComments.push(
                        this.getSingleLineComment({
                            body: this._getCommentBody(),
                            index
                        })
                    );
                }

                continue;
            }

            if (this.isAppliedToMultiLineComments && rawRow.startsWith('/*')) {
                const comment = this._resolveMultiLineComment(index, rawRow);

                if (comment) {
                    unmarkedComments.push(comment);

                    comment?.to ? (index = comment.to) : null;
                }

                continue;
            }

            if (
                this.isAppliedToInlineComments &&
                (rawRow.includes('//') || rawRow.includes('/*'))
            ) {
                const comment = this._resolveInlineComment(index, rawRow);

                if (comment) {
                    unmarkedComments.push(comment);

                    comment?.to ? (index = comment.to) : null;
                }
            }
        }

        return unmarkedComments;
    }

    _resolveMultiLineComment(index, rawRow) {
        let comment = null;

        if (rawRow.includes('*/') && !this._startsWithPrefix(rawRow)) {
            comment = this.getSingleLineComment({
                body: this._getCommentBody(),
                index
            });

            return comment;
        }

        const result = this._verifyMultiLineComment(index);

        if (!result.hasValidPrefix && result?.endIndex) {
            comment = this.getMultiLineComment({
                body: this._getCommentBody(true),
                from: index,
                to: result.endIndex
            });
        }

        return comment;
    }

    _resolveInlineComment(index, rawRow) {
        const commentInString = this._findCommentInString(rawRow);
        let clearedRow = rawRow;
        let comment = null;

        if (commentInString) {
            clearedRow = clearedRow.replace(commentInString, '');
        }

        const result = this._matchInlineComment(clearedRow);

        if (!result) {
            return comment;
        }

        if (
            (result.startsWith('//') || result.endsWith('*/')) &&
            !this._startsWithPrefix(result)
        ) {
            comment = this.getSingleLineComment({
                body: this._getCommentBody(),
                index
            });
        } else if (!this._startsWithPrefix(result)) {
            const result = this._verifyMultiLineComment(index);

            if (!result.hasValidPrefix && result?.endIndex) {
                comment = this.getMultiLineComment({
                    body: this._getCommentBody(true),
                    from: index,
                    to: result.endIndex
                });
            }
        }

        return comment;
    }

    _verifyMultiLineComment(multiLineStartIndex) {
        const { splitPatch } = this.file;
        const splitPatchLength = splitPatch.length;

        let hasValidPrefix = false;
        let endIndex = null;

        for (
            let index = multiLineStartIndex;
            index < splitPatchLength;
            index++
        ) {
            const row = splitPatch[index];

            const result = this._matchMultiLineComment(row);

            if (result && !hasValidPrefix && this._startsWithPrefix(result)) {
                hasValidPrefix = true;
            }

            if (row.includes('*/')) {
                endIndex = index;

                break;
            }
        }

        return {
            hasValidPrefix,
            endIndex
        };
    }

    _startsWithPrefix(row) {
        const fixedRow = row.replace(/(\/\/|\*|\/\*)/, '').trim();

        return this.prefixes.some(({ value }) => fixedRow.startsWith(value));
    }

    _findCommentInString(row) {
        const result = row.match(/["|'|`].*[(//)|(/*)].*["|'|`]/);

        return result ? result[0] : null;
    }

    _matchInlineComment(row) {
        const result = row.match(/[//|/*].*/);

        return result ? result[0].trim() : null;
    }

    _matchMultiLineComment(row) {
        const result = row.match(/[*|/*|].*/);

        return result ? result[0].trim() : null;
    }

    _hasInvalidConfig() {
        return (
            !this.prefixes?.length ||
            !(
                this.isAppliedToSingleLineComments &&
                this.isAppliedToMultiLineComments &&
                this.isAppliedToInlineComments
            )
        );
    }

    _getCommentBody(isMultiLine = false) {
        let formattedPrefixes = '';

        this.prefixes.forEach((prefix) => {
            formattedPrefixes = `${formattedPrefixes}
            - \` ${prefix.value} \` (${prefix.meaning})`;
        });

        const start = isMultiLine ? 'At least one line' : 'Comment';

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
