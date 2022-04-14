const BaseRule = require('../Base');
const dedent = require('dedent-js');

class NoUnmarkedCommentsRule extends BaseRule {
    /**
     * @param {Array<{prefixes: Array<object>, isAppliedToSingleLineComments: boolean, isAppliedToMultiLineComments: boolean, isAppliedToInlineComments: boolean }>} config
     * @param {Array<object>} config.prefixes - array of prefixes that should be used in comments
     * @param {boolean} config.isAppliedToSingleLineComments
     * @param {boolean} config.isAppliedToMultiLineComments
     * @param {boolean} config.isAppliedToInlineComments
     */
    constructor(config) {
        super();

        const {
            prefixes,
            isAppliedToSingleLineComments,
            isAppliedToMultiLineComments,
            isAppliedToInlineComments,
        } = config;

        this.prefixes = prefixes;
        this.isAppliedToSingleLineComments = isAppliedToSingleLineComments;
        this.isAppliedToMultiLineComments = isAppliedToMultiLineComments;
        this.isAppliedToInlineComments = isAppliedToInlineComments;
    }

    invoke(file) {
        if (this._hasInvalidConfig()) {
            probotInstance.log.error(
                `Couldn't run rule ${__filename} on ${file.filename}. Invalid config!`
            );

            return [];
        }

        const { split_patch: splitPatch } = file;
        let unmarkedComments = [];

        for (let index = 0; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (row.startsWith(this.DELETED)) {
                continue;
            }

            const rawRow = this.getRawContent(row);

            if (rawRow.startsWith('@@')) {
                continue;
            }

            if (this.isAppliedToSingleLineComments && rawRow.startsWith('//')) {
                if (!this._startsWithPrefix(rawRow)) {
                    unmarkedComments.push(
                        this.getSingleLineComment({
                            file,
                            body: this._getCommentBody(),
                            index,
                        })
                    );
                }

                continue;
            }

            if (this.isAppliedToMultiLineComments && rawRow.startsWith('/*')) {
                const comment = this._resolveMultiLineComment(
                    file,
                    index,
                    rawRow
                );

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
                const comment = this._resolveInlineComment(file, index, rawRow);

                if (comment) {
                    unmarkedComments.push(comment);

                    comment?.to ? (index = comment.to) : null;
                }
            }
        }

        return unmarkedComments;
    }

    _resolveMultiLineComment(file, index, rawRow) {
        const { split_patch: splitPatch } = file;
        let comment = null;

        if (rawRow.includes('*/') && !this._startsWithPrefix(rawRow)) {
            comment = this.getSingleLineComment({
                file,
                body: this._getCommentBody(),
                index,
            });

            return comment;
        }

        const result = this._verifyMultiLineComment(splitPatch, index);

        if (!result.hasValidPrefix && result?.endIndex) {
            comment = this.getMultiLineComment({
                file,
                body: this._getCommentBody(true),
                from: index,
                to: result.endIndex,
            });
        }

        return comment;
    }

    _resolveInlineComment(file, index, rawRow) {
        const commentInString = this._findCommentInString(rawRow);
        const { split_patch: splitPatch } = file;
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
                file,
                body: this._getCommentBody(),
                index,
            });
        } else if (!this._startsWithPrefix(result)) {
            const result = this._verifyMultiLineComment(splitPatch, index);

            if (!result.hasValidPrefix && result?.endIndex) {
                comment = this.getMultiLineComment({
                    file,
                    body: this._getCommentBody(true),
                    from: index,
                    to: result.endIndex,
                });
            }
        }

        return comment;
    }

    _verifyMultiLineComment(splitPatch, multiLineStartIndex) {
        let hasValidPrefix = false;
        let endIndex = null;

        for (
            let index = multiLineStartIndex;
            index < splitPatch.length;
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
            endIndex,
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
            <summary> List of allowed prefixes </summary> \n\n${dedent(
                formattedPrefixes
            )}
        </details>`;

        return dedent(commentBody);
    }
}

module.exports = NoUnmarkedCommentsRule;
