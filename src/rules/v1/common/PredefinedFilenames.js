const BaseRule = require('src/rules/Base');

class PredefinedFilenamesRule extends BaseRule {
    /**
     * imposes specific filename structure. Note that path containing asterisk or slash only is ignored. End path with asterisk if you want to allow rule to match any number of levels after declared path e.g. `dir1/dir2/*` would match `dir1/dir2/dir3/a.js`, `dir1/dir2/b.js` etc..
     *
     * @param {PatchronContext} patchronContext
     * @param {PredefinedFilenamesConfig} config
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
        const filePath = filename.substring(0, filename.lastIndexOf('/'));

        for (const { path, expectedName } of this.restrictions) {
            let isFilenameMatched = false;
            const isPathWithAsterisk = path.endsWith('*');

            if (isPathWithAsterisk) {
                const fixedPath = path.slice(0, -1);

                isFilenameMatched = filename.startsWith(fixedPath);
            } else {
                const fixedPath = path.endsWith('/')
                    ? path.substring(0, path.lastIndexOf('/'))
                    : path;

                isFilenameMatched = filePath === fixedPath;
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
            .pop()}</em> (\`${filename}\`) should match following regex: \`${expectedName}\``;
    }
}

module.exports = PredefinedFilenamesRule;
