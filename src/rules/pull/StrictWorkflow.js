const dedent = require('dedent-js');
const BaseRule = require('../Base');

class StrictWorkflowRule extends BaseRule {
    constructor(pepegaContext, config) {
        super(pepegaContext);

        const {
            enabled,
            workflow,
            abortReviewOnInvalidBranchPrefix,
            abortReviewOnInvalidFlow
        } = config;

        this.enabled = enabled;
        this.workflowArray = workflow;
        this.abortReviewOnInvalidFlow = abortReviewOnInvalidFlow;
        this.abortReviewOnInvalidBranchPrefix =
            abortReviewOnInvalidBranchPrefix;
    }

    invoke() {
        if (this.workflowArray.length === 0) {
            this.logError(__filename, 'Could not run rule. Empty workflow.');

            return null;
        }

        const {
            pullRequest: { context }
        } = this.pepegaContext;

        const payload = context.payload;

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

        const body = this._getComment(
            mergeFrom,
            mergeTo,
            hasMergeFromValidPrefx,
            isMergeToValid
        );

        const isReviewAborted =
            this.abortReviewOnInvalidBranchPrefix ||
            this.abortReviewOnInvalidFlow;

        return {
            body,
            isReviewAborted
        };
    }

    _getComment(mergeFrom, mergeTo, hasMergeFromValidPrefix, isMergeToValid) {
        let commentBody = null;

        if (!isMergeToValid && hasMergeFromValidPrefix) {
            commentBody = `Invalid flow (\`base: ${mergeTo}\` <- \`head: ${mergeFrom}\`). Change base branch?`;
        } else {
            commentBody = `Unrecognized head prefix (\`${mergeFrom}\`).`;
        }

        if (!hasMergeFromValidPrefix) {
            let formattedWorkflow = '';

            this.workflowArray.forEach((workflowItem) => {
                formattedWorkflow = `${formattedWorkflow}
                - \` ${workflowItem.base} \` <--- \` ${workflowItem.head} \``;
            });

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
