const dedent = require('dedent-js');

class StrictWorkflowRule {
    constructor(config) {
        const { workflow } = config;

        this.workflowArray = workflow;
    }

    invoke(payload) {
        if (this.workflowArray.length === 0) {
            probotInstance.log.error(
                `Couldn't run rule ${__filename}. Empty workflow.`
            );

            return [];
        }

        const { head, base } = payload.pull_request;

        const { ref: mergeTo } = base;
        const { ref: mergeFrom } = head;

        let hasMergeFromValidPrefx = false;
        let isMergeToValid = false;

        for (const workflowItem of this.workflowArray) {
            if (mergeFrom.startsWith(`${workflowItem.head}/`)) {
                hasMergeFromValidPrefx = true;

                isMergeToValid = mergeTo === workflowItem.base;

                break;
            }
        }

        let comment = null;

        if (!hasMergeFromValidPrefx) {
            comment = this._getCommentBody(mergeFrom, mergeTo, 'prefix');
        } else if (!isMergeToValid) {
            comment = this._getCommentBody(mergeFrom, mergeTo, 'flow');
        }

        return comment;
    }

    _getCommentBody(mergeFrom, mergeTo, reason) {
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

        return {
            body: dedent(commentBody),
            reason,
        };
    }
}

module.exports = StrictWorkflowRule;
