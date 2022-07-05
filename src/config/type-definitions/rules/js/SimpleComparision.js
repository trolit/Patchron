/**
 * @typedef {object} SimpleComparisionRuleConfig
 * @property {Array<Pattern>} patterns
 */

/**
 * @typedef {object} Pattern
 * @property {string} [name] optional name (for readability)
 * @property {object} expression regular expression to match code that should be simplified
 * @property {string} comment text that is included in the comment (e.g. for suggestions)
 * @property {Array<MultiLineOption>} multiLineOptions
 */
