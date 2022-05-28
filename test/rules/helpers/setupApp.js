const fs = require('fs');
const nock = require('nock');
const { Probot, ProbotOctokit } = require('probot');

const app = require('src');
const PepegaContext = require('src/builders/PepegaContext');

const privateKey = fs.readFileSync('test/fixtures/mock-cert.pem', 'utf-8');

module.exports = () => {
    nock.disableNetConnect();

    const probot = new Probot({
        appId: 123,
        privateKey,
        Octokit: ProbotOctokit.defaults({
            retry: { enabled: false },
            throttle: { enabled: false }
        }),
        // when assigned, output logs only from assigned level and above
        logLevel: 'fatal'
    });

    probot.load(app);

    const pepegaContext = new PepegaContext(probot);

    return pepegaContext;
};
