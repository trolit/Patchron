const fs = require('fs');
const path = require('path');
const nock = require('nock');
const { Probot, ProbotOctokit } = require('probot');

const app = require('../../src');

const privateKey = fs.readFileSync(
    path.join(__dirname, '../fixtures/mock-cert.pem'),
    'utf-8'
);

module.exports = () => {
    nock.disableNetConnect();

    const probot = new Probot({
        appId: 123,
        privateKey,
        Octokit: ProbotOctokit.defaults({
            retry: { enabled: false },
            throttle: { enabled: false }
        })
    });

    probot.load(app);

    return probot;
};
