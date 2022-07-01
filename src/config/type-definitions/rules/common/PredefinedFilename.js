/**
 * @typedef {object} PredefinedFilenameConfig
 * @property {Array<Restriction>} restrictions
 */

/**
 * @typedef {object} Restriction
 * @property {string} path used to tie files from specific locations to specific restrictions. End path with `asterisk` (e.g. `src/helpers/*`) to allow for any number of directory levels after specified `path`.
 * @property {object} expectedName regular expression that contains structure of valid filename
 */
