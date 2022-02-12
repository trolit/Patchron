const dedent = require('dedent-js');
const getLineNumber = require('../../helpers/getLineNumber');
const removeWhitespaces = require('../../helpers/removeWhitespaces');
const ReviewCommentBuilder = require('../../builders/ReviewComment');

class NoUnmarkedCommentsRule {
    constructor(config) {
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

        for (let rowIndex = 0; rowIndex < splitPatch.length; rowIndex++) {
            const rowContent = splitPatch[rowIndex];
            const minifiedRowContent = removeWhitespaces(rowContent);

            if (!minifiedRowContent.startsWith('+')) {
                continue;
            }

            if (
                this.isAppliedToSingleLineComments &&
                this._isInvalidSingleLineComment(minifiedRowContent)
            ) {
                unmarkedComments.push(
                    this._getSingleLineComment(file, rowIndex)
                );

                continue;
            }

            if (
                this.isAppliedToMultiLineComments &&
                this._isMultiLineComment(minifiedRowContent)
            ) {
                if (
                    minifiedRowContent.startsWith('+/*') &&
                    !minifiedRowContent.endsWith('*/')
                ) {
                    const { wasAnyInvalidLineFound, lastIndex } =
                        this._resolveMultiLineComment(rowIndex, splitPatch);

                    if (wasAnyInvalidLineFound) {
                        const multiLineComment = this._getMultiLineComment(
                            file,
                            rowIndex
                        );

                        unmarkedComments.push(multiLineComment.comment);
                    }

                    rowIndex = lastIndex;
                } else {
                    if (!this._isValidMultiLineComment(minifiedRowContent)) {
                        unmarkedComments.push(
                            this._getSingleLineComment(file, rowIndex)
                        );
                    }
                }

                continue;
            }

            if (
                this.isAppliedToInlineComments &&
                this._isInvalidInlineComment(minifiedRowContent)
            ) {
                unmarkedComments.push(
                    this._getSingleLineComment(file, rowIndex)
                );

                continue;
            }
        }

        return unmarkedComments;
    }

    _hasInvalidConfig() {
        return !(
            this.isAppliedToSingleLineComments &&
            this.isAppliedToMultiLineComments &&
            this.isAppliedToInlineComments
        );
    }

    _isInvalidSingleLineComment(minifiedRowContent) {
        return (
            this._isSingleLineComment(minifiedRowContent) &&
            !this._isValidSingleLineComment(minifiedRowContent)
        );
    }

    _isInvalidInlineComment(minifiedRowContent) {
        return (
            this._isInlineComment(minifiedRowContent) &&
            !this._isValidInlineComment(minifiedRowContent)
        );
    }

    _isSingleLineComment(minifiedRowContent) {
        return minifiedRowContent.startsWith('+//');
    }

    _isInlineComment(minifiedRowContent) {
        return (
            minifiedRowContent.includes('//') ||
            minifiedRowContent.includes('/*')
        );
    }

    _isMultiLineComment(minifiedRowContent) {
        return (
            minifiedRowContent.startsWith('+/*') ||
            minifiedRowContent.startsWith('+*')
        );
    }

    _isValidSingleLineComment(minifiedRowContent) {
        let isWithPrefix = false;

        for (const prefix in this.prefixes) {
            const prefixValue = this.prefixes[prefix].value;

            if (minifiedRowContent.startsWith(`+//${prefixValue}`)) {
                isWithPrefix = true;
                break;
            }
        }

        return isWithPrefix;
    }

    _isValidInlineComment(rowContent) {
        const splitRowContent = rowContent.split(/"|'|`/);

        const lastRow = splitRowContent[splitRowContent.length - 1];

        const nearestCommentSymbolMatch = lastRow.match(/(\/\/|\/\*)/);

        let isWithPrefix = false;

        if (!nearestCommentSymbolMatch) {
            return isWithPrefix;
        }

        const lastRowFragment = removeWhitespaces(
            lastRow.substring(nearestCommentSymbolMatch.index)
        );

        for (const prefix in this.prefixes) {
            const prefixValue = this.prefixes[prefix].value;

            if (
                lastRowFragment.startsWith(`//${prefixValue}`) ||
                lastRowFragment.startsWith(`/*${prefixValue}`)
            ) {
                isWithPrefix = true;

                break;
            }
        }

        return isWithPrefix;
    }

    _isValidMultiLineComment(minifiedRowContent) {
        let isWithPrefix = false;

        for (const prefix in this.prefixes) {
            const prefixValue = this.prefixes[prefix].value;

            if (
                minifiedRowContent.startsWith(`+/*${prefixValue}`) ||
                minifiedRowContent.startsWith(`+*${prefixValue}`)
            ) {
                isWithPrefix = true;
                break;
            }
        }

        return isWithPrefix;
    }

    _getSingleLineComment(file, rowIndex) {
        const { split_patch: splitPatch } = file;

        const line = getLineNumber(splitPatch, 'right', rowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildSingleLineComment({
            body: this._getCommentBody(),
            line,
            side: 'RIGHT',
        });

        return comment;
    }

    _getMultiLineComment(file, rowIndex) {
        const { split_patch: splitPatch } = file;

        const start_line = getLineNumber(splitPatch, 'right', rowIndex);

        let position = 0;
        let index = 0;

        for (index = rowIndex; index < splitPatch.length; index++) {
            position++;

            const minifiedSplitPatchRow = removeWhitespaces(splitPatch[index]);

            if (minifiedSplitPatchRow.startsWith('+*/')) {
                break;
            }
        }

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildMultiLineComment({
            body: this._getCommentBody(),
            start_line,
            start_side: 'RIGHT',
            position,
        });

        return {
            comment,
            newRowIndex: index,
        };
    }

    _getCommentBody() {
        let formattedPrefixes = '';

        this.prefixes.forEach((prefix) => {
            formattedPrefixes = `${formattedPrefixes}
            - \` ${prefix.value} \` (${prefix.meaning})`;
        });

        const commentBody = `Prefix comments with one of the predefined values 
         
        <details>
            <summary> List of allowed prefixes </summary> \n\n${dedent(
                formattedPrefixes
            )}
        </details>`;

        return dedent(commentBody);
    }

    _resolveMultiLineComment(rowIndex, splitPatch) {
        let isValid = false;
        let wasAnyInvalidLineFound = false;
        let lastIndex = rowIndex;

        for (let i = rowIndex; i < splitPatch.length; i++) {
            const minifiedRowContent = removeWhitespaces(splitPatch[i]);

            if (
                !wasAnyInvalidLineFound &&
                minifiedRowContent.startsWith('+*/') &&
                minifiedRowContent.length > 4
            ) {
                isValid = this._isValidMultiLineComment(minifiedRowContent);

                if (!isValid) {
                    wasAnyInvalidLineFound = true;
                }
            } else if (minifiedRowContent.startsWith('+*/')) {
                lastIndex = i;

                break;
            } else if (
                !wasAnyInvalidLineFound &&
                i === rowIndex &&
                minifiedRowContent.length > 4
            ) {
                isValid = this._isValidMultiLineComment(minifiedRowContent);

                if (!isValid) {
                    wasAnyInvalidLineFound = true;
                }
            } else if (minifiedRowContent.startsWith('+*')) {
                isValid = this._isValidMultiLineComment(minifiedRowContent);

                if (!isValid) {
                    wasAnyInvalidLineFound = true;
                }
            }
        }

        return {
            lastIndex,
            wasAnyInvalidLineFound,
        };
    }
}

module.exports = NoUnmarkedCommentsRule;
