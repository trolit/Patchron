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

        const { head, base } = payload;

        const { ref: mergeTo } = base;
        const { ref: mergeFrom } = head;

        let hasMergeFromValidPrefx = false;
        let isMergeToValid = false;

        for (const workflowItem in this.workflowArray) {
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
            - ${workflowItem.base} <--- (${workflowItem.head}/)`;
        });

        const description =
            reason === 'prefix'
                ? `Invalid branch prefix :worried: (\`${mergeFrom}\`)`
                : `Invalid flow (\`${mergeTo}\` <- \`${mergeFrom}\`)`;

        const commentBody = `${description} 
         
        <details>
            <summary> Current workflow </summary> \n\n${dedent(
                formattedWorkflow
            )}
        </details>`;

        return dedent(commentBody);
    }
}

module.exports = StrictWorkflowRule;
