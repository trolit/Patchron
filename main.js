const { run: runAsServer } = require('probot');
const { run: runAsAction } = require('@probot/adapter-github-actions');

const app = require('./src/index');

const githubToken = process.env.GITHUB_TOKEN;

if (githubToken) {
    runAsAction(app);
} else {
    runAsServer(app);
}
