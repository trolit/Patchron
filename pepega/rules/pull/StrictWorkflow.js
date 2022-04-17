const dedent = require('dedent-js');
const BaseRule = require('../Base');

class StrictWorkflowRule extends BaseRule {
    constructor(config) {
        super();

        const {
            enabled,
            workflow,
            abortReviewOnInvalidBranchPrefix,
            abortReviewOnInvalidFlow,
        } = config;

        this.enabled = enabled;
        this.workflowArray = workflow;
        this.abortReviewOnInvalidFlow = abortReviewOnInvalidFlow;
        this.abortReviewOnInvalidBranchPrefix =
            abortReviewOnInvalidBranchPrefix;
    }

    invoke(payload) {
        if (!this.enabled) {
            return null;
        }

        if (this.workflowArray.length === 0) {
            this.logError(__filename, 'Could not run rule. Empty workflow.');

            return null;
        }

        const { head, base } = payload.pull_request;
        const { ref: mergeFrom } = head;
        const { ref: mergeTo } = base;

        let hasMergeFromValidPrefx = false;
        let isMergeToValid = false;

        for (const workflowItem of this.workflowArray) {
            if (mergeFrom.startsWith(`${workflowItem.head}/`)) {
                hasMergeFromValidPrefx = true;

                isMergeToValid = mergeTo === workflowItem.base;

                break;
            }
        }

        if (hasMergeFromValidPrefx && isMergeToValid) {
            return null;
        }

        let body = null;
        let isReviewAborted = false;

        if (!hasMergeFromValidPrefx) {
            body = this._getComment(mergeFrom, mergeTo, 'prefix');

            isReviewAborted = this.abortReviewOnInvalidBranchPrefix;
        } else if (!isMergeToValid) {
            body = this._getComment(mergeFrom, mergeTo, 'flow');

            isReviewAborted = this.abortReviewOnInvalidFlow;
        }

        return {
            body,
            isReviewAborted,
        };
    }

    _getComment(mergeFrom, mergeTo, reason) {
        let formattedWorkflow = '';

        this.workflowArray.forEach((workflowItem) => {
            formattedWorkflow = `${formattedWorkflow}
            - \` ${workflowItem.base} \` <--- \` ${workflowItem.head} \``;
        });

        const description =
            reason === 'prefix'
                ? `Invalid branch prefix :worried: (\`${mergeFrom}\`). Please, fix branch name and create new PR.`
                : `Invalid flow (\`${mergeTo}\` <- \`${mergeFrom}\`). Either change base branch (recommended) or create new PR.`;

        let commentBody = `${description}`;

        if (reason === 'flow') {
            const workflowSnippet = `<details>
            <summary> Current allowed workflow </summary> \n\n${dedent(
                formattedWorkflow
            )}
            </details>`;

            commentBody = commentBody.concat('\n', workflowSnippet);
        }

        return dedent(commentBody);
    }
}

module.exports = StrictWorkflowRule;
