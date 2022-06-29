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
        const reviewComments = [];

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = PredefinedFilenameRule;
