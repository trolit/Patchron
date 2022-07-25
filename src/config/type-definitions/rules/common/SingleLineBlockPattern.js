/**
 * @typedef {object} SingleLineBlockPatternConfig
 * @property {Array<Block>} blocks
 * @property {boolean} curlyBraces true indicates that matched blocks should be wrapped with curly braces {}
 */

/**
 * @typedef {object} Block
 * @property {string} name
 * @property {object} expression
 * @property {Array<MultiLineOption>} [multiLineOptions]
 * @property {boolean} countAsSingleLineBlockWhenNoBraces when true, matched block is instantly counted as single line block when no braces were found.
 */
