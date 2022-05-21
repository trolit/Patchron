// https://stackoverflow.com/a/60030618

/**
 * @typedef {Object} Backticks `SplitPatchRow` property added via extension, `extedWithBackticks`
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
 * @property {Backticks} backticks information about row's backticks (available via extension). When line has no backticks, it's value is `null`
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

/**
 * @typedef {Object} Repo
 * @property {string} owner repository owner
 * @property {string} repo repository name
 * @property {string} path path to file
 */

/**
 * @typedef {Object} PullRequest
 * @property {string} owner hooked pull request owner's login
 * @property {number} id hooked pull request's id
 * @property {ProbotContext} context reference to Probot's context
 */

/**
 * @typedef {Object} PepegaContext
 * @property  {import('../../utilities/EventLog')} log
 * @property {Repo} repo
 * @property {PullRequest} pullRequest
 */

/**
 * @typedef {import('probot').Context} ProbotContext
 */

/**
 * @typedef {import('probot').Probot} ProbotApp
 */

/**
 * @typedef {Object} MultiLineComment file review comment
 * @property {string} owner repository owner's name
 * @property {string} repo reporitory's name
 * @property {number} pull_number PR id
 * @property {string} body
 * @property {number} start_line line number (counted from hunk header '@@')
 * @property {'LEFT'|'RIGHT'} start_side which side line refers to (LEFT=deletion, RIGHT=addition)
 * @property {number} position  number of lines to take into review (counted from line after '@@')
 * @property {string} path
 * @property {string} commit_id
 */

/**
 * @typedef {Object} SingleLineComment file review comment
 * @property {string} owner repository owner's name
 * @property {string} repo reporitory's name
 * @property {number} pull_number PR id
 * @property {string} body
 * @property {number} line line number (counted from hunk header '@@')
 * @property {'LEFT'|'RIGHT'} side which side line refers to (LEFT=deletion, RIGHT=addition)
 * @property {number} position  number of lines to take into review (counted from line after '@@')
 * @property {string} path
 * @property {string} commit_id
 */
