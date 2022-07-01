const BaseRule = require('src/rules/Base');

class PredefinedFilenameRule extends BaseRule {
    /**
     * imposes specific filename structure. Path containing asterisk or slash only is ignored. End path with asterisk if you want to allow rule to match any number of levels after declared path e.g. `dir1/dir2/*` would match `dir1/dir2/dir3/a.js`, `dir1/dir2/b.js` etc..
     *
     * @param {PatchronContext} patchronContext
     * @param {PredefinedFilenameConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { restrictions } = config;

        const filteredRestrictions = restrictions.filter(
            ({ path }) => path !== '*' && path !== '/'
        );

        this.restrictions = filteredRestrictions;
    }

    invoke() {
        if (!this.restrictions.length) {
            this.log.warning(__filename, 'No restrictions defined', this.file);

            return null;
        }

        const { filename } = this.file;

        for (const { path, expectedName } of this.restrictions) {
            let isFilenameMatched = false;
            const isPathWithAsterisk = path.endsWith('*');

            if (isPathWithAsterisk) {
                const fixedPath = path.slice(0, -1);

                isFilenameMatched = filename.startsWith(fixedPath);
            } else {
                const fixedPath = `${path}${path.endsWith('/') ? '' : '/'}`;
                const modifiedPath = fixedPath.replace(fixedPath, '');

                isFilenameMatched = !modifiedPath.includes('/');
            }

            const rawFilename = filename.split('/').pop();
            const isFilenameValid = rawFilename.match(expectedName);

            if (isFilenameMatched && !isFilenameValid) {
                return {
                    body: this._getCommentBody(filename, expectedName)
                };
            }
        }

        return null;
    }

    /**
     * @returns {string}
     */
    _getCommentBody(filename, expectedName) {
        return `Filename <em>${filename
            .split('/')
            .pop()}</em> (\`${filename}\`) should match following expression: \`${expectedName}\``;
    }
}

module.exports = PredefinedFilenameRule;
