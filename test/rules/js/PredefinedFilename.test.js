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
    restrictions: [
        {
            path: 'backend/controllers/*',
            expectedName: /.*Controller.js/
        },
        {
            path: 'backend/helpers/*',
            expectedName: /^[a-z].*.js/
        },
        {
            path: 'backend/plugins/*',
            expectedName: /^[a-z].*.js/
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

    it('returns null on empty restrictions', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            {
                restrictions: []
            },
            {
                ...file,
                filename: 'test/index.test.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null on unmatched path (example1)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'src/test.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null on unmatched path (example2)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/helpers/IsItWorking.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns null on valid predefined filename', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/controllers/Employee/IndexController.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns object on invalid predefined filename (example1)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/controllers/Employee/someFile.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns object on invalid predefined filename (example2)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/helpers/IsItWorking.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns null on valid predefined filename (without asterisk)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            {
                restrictions: [
                    {
                        ...config,
                        path: 'backend/controllers'
                    }
                ]
            },
            {
                ...file,
                filename: 'backend/controllers/IndexController.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null on unmatched path (without asterisk)', () => {
        const predefinedFilenameRule = new PredefinedFilenameRule(
            patchronContext,
            {
                restrictions: [
                    {
                        ...config,
                        path: 'backend/controllers'
                    }
                ]
            },
            {
                ...file,
                filename: 'backend/controllers/Employee/IndexController.js'
            }
        );

        const result = predefinedFilenameRule.invoke();

        expect(result).toEqual(null);
    });
});
