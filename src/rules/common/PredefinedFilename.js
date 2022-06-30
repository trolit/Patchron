const sortBy = require('lodash/sortBy');
const BaseRule = require('src/rules/Base');

class PredefinedFilenameRule extends BaseRule {
    /**
     * imposes specific filename structure. Restrictions are checked in order from shortest path to longest. Path containing asterisk or slash only is ignored. End path with asterisk if you want to allow rule to match any number of levels after declared path e.g. `test/backend/*`.
     *
     * @param {PatchronContext} patchronContext
     * @param {PredefinedFilenameConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { restrictions } = config;

        const filteredRestrictions = restrictions.filter(
            ({ path }) => path !== '*' || path !== '/'
        );

        this.restrictions = sortBy(filteredRestrictions, 'path');
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

            const isFilenameValid = path.match(expectedName);

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
        return `Found filename: \`${filename}\`, expected: \`${expectedName}\``;
    }
}

module.exports = PredefinedFilenameRule;
