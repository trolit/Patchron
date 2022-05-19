/**
 * @typedef {object} keyword
 * @property {string} name readable name
 * @property {object} regex regular expression to match line with keyword
 * @property {Array<string>} multiLineOptions array of strings to help identify whether matched line is multi-line or single-line
 * @property {'ascending'|'descending'} order ascending/descending
 * @property {boolean} ignoreNewline when set to 'true' **(not recommended)**, rule is tested against all keywords matched in given data and when 'false' **(recommended)**, only adjacent ones.
 *
 * e.g. when keywords are at lines: 0, 1, 2, 5, 6, 10, `false` makes that rule apply only across group: `[0, 1, 2] and [5, 6]`.
 */

/**
 * @typedef {Object} Config
 * @property {Array<keyword>} keywords
 */
