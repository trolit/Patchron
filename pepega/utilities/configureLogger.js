const {
    settings: { isStoringLogsEnabled }
} = require('../config');

module.exports = (app) => {
    global.log = isStoringLogsEnabled ? configureLogsStoring() : app.log;
};

function configureLogsStoring() {
    const stream = require('stream');
    const logThrough = new stream.PassThrough();

    const childProcess = require('child_process');

    const pinoms = require('pino-multi-stream');
    const prettyStream = pinoms.prettyStream();

    const streams = [{ stream: logThrough }, { stream: prettyStream }];
    const log = pinoms(pinoms.multistream(streams));

    const dir = `${__dirname}/../../.logs`;

    const fs = require('fs');
    const path = require('path');

    const { env } = process;
    const cwd = process.cwd();

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const basePath = path.join(`${__dirname}`, '..', '..', '.logs');

    const child = childProcess.spawn(
        process.execPath,
        [
            require.resolve('pino-tee'),
            'warn',
            `${basePath}/warn`,
            'error',
            `${basePath}/error`,
            'fatal',
            `${basePath}/fatal`,
            'info',
            `${basePath}/info`
        ],
        { cwd, env }
    );

    logThrough.pipe(child.stdin);

    return log;
}
