const fs = require('fs');
const dayjs = require('dayjs');
const { CronJob } = require('cron');
const pinoms = require('pino-multi-stream');

module.exports = (eventEmitter) => {
    const start = true;
    const context = null;
    const runOnInit = true;
    const onComplete = null;
    const cronTime = '0 0 0 * * *';
    const timeZone = 'Europe/Warsaw';

    const onTick = () => {
        const logsParentDirectory = `${__dirname}/../../.logs`;

        if (!fs.existsSync(logsParentDirectory)) {
            fs.mkdirSync(logsParentDirectory);
        }

        const date = dayjs().format('YYYY-MM-DD');

        const prettyStream = pinoms.prettyStream();

        const streams = [
            {
                stream: fs.createWriteStream(
                    `${logsParentDirectory}/${date}.log`
                )
            },
            { stream: prettyStream }
        ];

        log = pinoms(pinoms.multistream(streams));

        eventEmitter.emit('path-updated', log);
    };

    new CronJob(
        cronTime,
        onTick,
        onComplete,
        start,
        timeZone,
        context,
        runOnInit
    );
};
