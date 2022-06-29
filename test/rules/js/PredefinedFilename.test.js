const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const {
    common: { PredefinedFilenameRule }
} = require('src/rules');
const setupApp = require('test/rules/helpers/setupApp');
const initializeFile = require('test/rules/helpers/initializeFile');

const config = {
    cases: [
        {
            path: 'backend/controllers/*',
            expectedFilename: /.*Controller.js/
        }
    ]
};

describe('invoke function', () => {
    let patchronContext = null;
    let file = {};

    beforeEach(() => {
        patchronContext = setupApp();

        file = initializeFile();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    it('returns empty array on empty cases', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            {
                cases: []
            },
            {
                ...file,
                filename: 'test/index.test.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on unmatched path', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'src/test.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns empty array on valid predefined filename (with asterisk)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/controllers/Employee/IndexController.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual([]);
    });

    it('returns review on invalid predefined filename (with asterisk)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/controllers/Employee/someFile.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toHaveLength(1);
    });

    it('returns empty array on unmatched path (without asterisk)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            {
                ...config,
                path: 'backend/controllers'
            },
            {
                ...file,
                filename: 'backend/controllers/Employee/IndexController.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual([]);
    });
});
