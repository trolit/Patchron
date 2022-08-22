const nock = require('nock');
const {
    describe,
    expect,
    it,
    beforeEach,
    afterEach
} = require('@jest/globals');

const setupPatchronContext = require('test/setupPatchronContext');
const initializeFile = require('test/rules/helpers/initializeFile');
const PredefinedFilenamesRule = require('src/rules/v1/common/PredefinedFilenames');

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
        patchronContext = setupPatchronContext();

        file = initializeFile();
    });

    afterEach(() => {
        nock.cleanAll();

        nock.enableNetConnect();
    });

    it('returns null on empty restrictions', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
            patchronContext,
            {
                restrictions: []
            },
            {
                ...file,
                filename: 'test/index.test.js'
            }
        );

        const result = predefinedFilenamesRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null on unmatched path (example1)', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'src/test.js'
            }
        );

        const result = predefinedFilenamesRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null on unmatched path (example2)', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/helpers/IsItWorking.js'
            }
        );

        const result = predefinedFilenamesRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns null on valid predefined filename', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/controllers/Employee/IndexController.js'
            }
        );

        const result = predefinedFilenamesRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns object on invalid predefined filename (example1)', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/controllers/Employee/someFile.js'
            }
        );

        const result = predefinedFilenamesRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns object on invalid predefined filename (example2)', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
            patchronContext,
            config,
            {
                ...file,
                filename: 'backend/helpers/IsItWorking.js'
            }
        );

        const result = predefinedFilenamesRule.invoke();

        expect(result).toHaveProperty('body');
    });

    it('returns null on valid predefined filename (without asterisk)', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
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

        const result = predefinedFilenamesRule.invoke();

        expect(result).toEqual(null);
    });

    it('returns null on unmatched path (without asterisk)', () => {
        const predefinedFilenamesRule = new PredefinedFilenamesRule(
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

        const result = predefinedFilenamesRule.invoke();

        expect(result).toEqual(null);
    });
});
