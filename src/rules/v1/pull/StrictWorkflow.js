const BaseRule = require('src/rules/Base');

class StrictWorkflowRule extends BaseRule {
    /**
     * checks if pull requested branch has valid prefix and flow
     *
     * @param {PatchronContext} patchronContext
     * @param {StrictWorkflowConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

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
            this.log.warning(__filename, 'Could not run rule. Empty workflow.');

            return null;
        }

        const {
            pullRequest: { context }
        } = this.patchronContext;

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

        const isReviewAborted =
            this.abortReviewOnInvalidBranchPrefix ||
            this.abortReviewOnInvalidFlow;

        const body = this._getComment(
            mergeFrom,
            mergeTo,
            hasMergeFromValidPrefx,
            isMergeToValid,
            isReviewAborted
        );

        return {
            body,
            isReviewAborted
        };
    }

    _getComment(
        mergeFrom,
        mergeTo,
        hasMergeFromValidPrefix,
        isMergeToValid,
        isReviewAborted
    ) {
        let commentBody = null;

        if (!isMergeToValid && hasMergeFromValidPrefix) {
            commentBody = `Invalid flow (\`base: ${mergeTo}\` <- \`head: ${mergeFrom}\`)`;
        } else {
            commentBody = `Unrecognized head prefix (\`${mergeFrom}\`).`;
        }

        commentBody.concat(`${isReviewAborted ? ' (review aborted)' : ''}`);

        if (!hasMergeFromValidPrefix) {
            let formattedWorkflow = '';

            this.workflowArray.forEach((workflowItem) => {
                formattedWorkflow = `${formattedWorkflow}
                - \` ${workflowItem.base} \` <--- \` ${workflowItem.head} \``;
            });

            const workflowSnippet = `<details>
            <summary> Current allowed workflow </summary> \n\n${this.dedent(
                formattedWorkflow
            )}
            </details>`;

            commentBody = commentBody.concat('\n', workflowSnippet);
        }

        return this.dedent(commentBody);
    }
}

module.exports = StrictWorkflowRule;
