/// <reference path="../../config/type-definitions/common.js" />
/// <reference path="../../config/type-definitions/rules/js/AsynchronousPattern.js" />

const BaseRule = require('src/rules/Base');

class AsynchronousPatternRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {AsynchronousPatternConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

        const { pattern } = config;

        this.pattern = pattern;

        const AWAIT_PATTERN = 'await';
        const THEN_PATTERN = 'then';

        this.AWAIT_PATTERN = AWAIT_PATTERN;
        this.THEN_PATTERN = THEN_PATTERN;

        this.validPatterns = [AWAIT_PATTERN, THEN_PATTERN];
    }

    invoke() {
        if (!this.validPatterns.includes(this.pattern)) {
            this.log.warning(
                __filename,
                'Unrecognized pattern in rule configuration',
                this.file
            );

            return [];
        }

        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);

        const reviewComments = this._reviewData(
            data,
            this.pattern === this.AWAIT_PATTERN ? '.then' : 'await'
        );

        return reviewComments;
    }

    _reviewData(data, pattern) {
        const reviewComments = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (
                trimmedContent.startsWith('@@') ||
                this.CUSTOM_LINES.includes(trimmedContent)
            ) {
                continue;
            }

            if (trimmedContent.includes(pattern)) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(),
                        index
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `Please, stick to \`${this.pattern}\` asynchronous pattern in the project.`;
    }
}

module.exports = AsynchronousPatternRule;
