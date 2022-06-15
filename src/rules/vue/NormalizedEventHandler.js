/// <reference path="../../config/type-definitions/common.js" />
/// <reference path="../../config/type-definitions/rules/vue/NormalizedEventHandler.js" />

const BaseRule = require('src/rules/Base');

class NormalizedEventHandlerRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {NormalizedEventHandlerConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

        const { prefix, noUnnecessaryBraces } = config;

        this.prefix = prefix;
        this.noUnnecessaryBraces = noUnnecessaryBraces;

        this.SHORTHAND_EVENT_EXPRESSION = /@click="(.*)"/;
        this.LONGHAND_EVENT_EXPRESSION = /v-on:click="(.*)"/;
    }

    invoke() {
        if (!this.prefix && !this.noUnnecessaryBraces) {
            this.log.warning(__filename, 'Rule has no effect.', this.file);

            return [];
        }

        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);

        const reviewComments = this._reviewData(data);

        return reviewComments;
    }

    _reviewData(data) {
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

            const matchResult =
                trimmedContent.match(this.SHORTHAND_EVENT_EXPRESSION) ||
                trimmedContent.match(this.LONGHAND_EVENT_EXPRESSION);

            if (!matchResult) {
                continue;
            }

            const eventHandler = matchResult[1];

            if (eventHandler.includes('=') || eventHandler.startsWith('$')) {
                continue;
            }

            const result = {
                isWithPrefix: this.prefix
                    ? eventHandler.startsWith(this.prefix)
                    : true,

                hasNoUnnecessaryBraces: this.noUnnecessaryBraces
                    ? trimmedContent.includes('()') ||
                      trimmedContent.includes('($event)')
                    : false
            };

            if (!result.isWithPrefix || result.hasNoUnnecessaryBraces) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(result),
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
    _getCommentBody(result) {
        return `Please 
        ${
            this.prefix && !result.isWithPrefix
                ? `, start event handler name with \`${this.prefix}\` prefix `
                : ''
        } 
        ${
            this.hasNoUnnecessaryBraces && !result.hasNoUnnecessaryBraces
                ? ', remove unnecessary braces.'
                : ''
        }`;
    }
}

module.exports = NormalizedEventHandlerRule;
