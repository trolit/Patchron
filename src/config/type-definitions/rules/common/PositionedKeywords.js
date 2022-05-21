/**
 * @typedef {object} PositionedKeywordsConfig
 * @property {Array<Keyword>} keywords array of prefixes that should be used in comments
 */

/**
 * @typedef {object} Keyword
 * @property {string} name readable name
 * @property {object} regex matches line(s) that should be validated against rule
 * @property {Array<string>} multiLineOptions if none of them will be included in matched line, line will be treated as multi-line.
 * @property {Position} position defines keyword expected position (custom or BOF). Configure each keyword with **only** one way of determining position.
 * @property {number} maxLineBreaks defines maximum allowed line breaks between each keyword. When 0, spaces between matched line(s) are counted as rule break
 * @property {boolean} enforced when **enabled**, it basically means that when patch does not have expected position that was provided within configuration - but it has at least two keywords - first occurence will be counted as expected position, which means, remaining ones must be positioned in relation to first one.
 * @property {boolean} breakOnFirstOccurence when **true**, stops keyword review on first invalid occurence
 * @property {boolean} countDifferentCodeAsLineBreak when **disabled**, code other than line break (\n), found between matched keywords is counted as rule break.
 * @property {Order} order allows to provide second layer of keyword positioning. Requires at least two objects to compare matched lines against themselves. For instance, for `import` keyword, second layer could enforce following positioning: `packages -> components -> helpers`
 */

/**
 * @typedef {object} Position
 * @property {Custom} custom
 * @property {boolean} BOF beginning of file
 */

/**
 * @typedef {object} Custom
 * @property {string} name
 * @property {string|object} expression
 */

/**
 * @typedef {object} Order
 * @property {string} name
 * @property {object} expression
 */
