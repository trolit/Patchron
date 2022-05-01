const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const stream = require('stream');
const { CronJob } = require('cron');
const pinoms = require('pino-multi-stream');
const childProcess = require('child_process');

module.exports = () => {
    new CronJob(
        '0 0 0 * * *',
        function () {
            const prettyStream = pinoms.prettyStream();
            const logThrough = new stream.PassThrough();

            const streams = [{ stream: logThrough }, { stream: prettyStream }];

            const log = pinoms(pinoms.multistream(streams));

            const logsParentDirectory = `${__dirname}/../../.logs`;

            const { env } = process;
            const cwd = process.cwd();

            if (!fs.existsSync(logsParentDirectory)) {
                fs.mkdirSync(logsParentDirectory);
            }

            const now = dayjs().format('YYYY-MM-DD');

            const logsDayDirectory = path.join(
                `${logsParentDirectory}`,
                `${now}`
            );

            if (!fs.existsSync(logsDayDirectory)) {
                fs.mkdirSync(logsDayDirectory);
            }

            const child = childProcess.spawn(
                process.execPath,
                [
                    require.resolve('pino-tee'),

                    'warn',
                    `${logsDayDirectory}/warn.log`,

                    'error',
                    `${logsDayDirectory}/error.log`,

                    'fatal',
                    `${logsDayDirectory}/fatal.log`,

                    'info',
                    `${logsDayDirectory}/info.log`
                ],
                { cwd, env }
            );

            logThrough.pipe(child.stdin);

            global.log = log;
        },
        null,
        true,
        'Europe/Warsaw',
        undefined,
        true
    );
};
