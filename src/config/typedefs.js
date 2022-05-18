// https://stackoverflow.com/a/60030618

/**
 * @typedef {Object} backticks `SplitPatchRow` property added via extension, `extedWithBackticks`
 * @property {number} endLineIndex index of row with backticks (if `endLineIndex` equals this then it's single line with backticks and if different, multi-line with backticks)
 * @property {object} thisLine
 * @property {number} thisLine.firstBacktickIndex
 * @property {number} thisLine.lastBacktickIndex
 * @property {number} thisLine.total
 */

/**
 * @typedef {Object} SplitPatchRow patch single row expressed with properties.
 * @property {number} index
 * @property {number} indentation indentation amount searched with `/\S|$/`
 * @property {string} content row content without GIT indication
 * @property {string} trimmedContent row content  without GIT indication after trim
 * @property {backticks} backticks information about row's backticks (available via extension). When line has no backticks, it's value is `null`
 */

/**
 * @typedef {Object} Patch part of file received via `getFiles` and extended in Pepega. Full response can be found here:
 * https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files
 * @property {string} sha unique ID (a.k.a. the "SHA" or "hash") that allows to keep record of the specific changes committed along with who made them and when.
 * @property {string} filename e.g. `test/index.test.js`
 * @property {'added'|'modified'|'deleted'} status
 * @property {number} additions
 * @property {number} deletions
 * @property {number} changes
 * @property {string} blob_url
 * `github.com/<username>/<reponame>/blob/<commit_id>/<filename>`
 * @property {string} raw_url
 * `github.com/<username>/<reponame>/raw/<commit_id>/<filename>`
 * @property {string} contents_url
 * `api.github.com/repos/<username>/<reponame>/contents/<filename>?ref=<commit_id>`
 * @property {string} commitId
 * @property {string} extension
 * @property {string} patch changes made to file
 * @property {Array<string>} splitPatch changes made to file split by \n
 */
