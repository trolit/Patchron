/**
 * fetches file from specified pull request
 * @param {object} context WebhookEvent instance.
 * @param {string} contents_url path to file's content URL.
 * @param {object} payload repository details.
 * @param {string} payload.owner repository owner's name
 * @param {string} payload.repo repository name
 * @param {string} payload.pull_number pull request Id
 * @return {object} file details and it's content encoded in base64.
 */
module.exports = async (context, contents_url, payload) => {
    let result = null;

    const contents_url_path = contents_url.replace(
        'https://api.github.com',
        ''
    );

    try {
        result = await context.octokit.request(
            `GET ${contents_url_path}`,
            payload
        );
    } catch (error) {
        probotInstance.log.error(
            `Failed to fetch file from PR:${payload.pull_number} of ${payload.repo} -> ${__filename}`
        );
    }

    return result;
};
