// https://stackoverflow.com/a/60030618

/**
 * @typedef {object} Backticks `SplitPatchRow` property added via extension, `extedWithBackticks`
 * @property {number} endLineIndex index of row with backticks (when equals index, it's single line row with backticks)
 * @property {object} thisLine
 * @property {number} thisLine.firstBacktickIndex
 * @property {number} thisLine.lastBacktickIndex
 * @property {number} thisLine.total
 */

/**
 * @typedef {object} SplitPatchRow patch single row expressed with properties.
 * @property {number} index
 * @property {number} indentation indentation amount searched with `/\S|$/`
 * @property {string} content row content without GIT indication
 * @property {string} trimmedContent row content  without GIT indication after trim
 * @property {Backticks} [backticks] information about row's backticks (available via extension). When line has no backticks, it's value is `null`
 */

/**
 * @typedef {object} Patch part of file received via `getFiles` and extended in Patchron. Full response can be found here:
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
 * @typedef {object} Repo
 * @property {string} owner repository owner
 * @property {string} repo repository name
 * @property {string} path path to file
 */

/**
 * @typedef {object} PullRequest
 * @property {string} owner hooked pull request owner's login
 * @property {number} id hooked pull request's id
 * @property {ProbotContext} context reference to Probot's context
 */

/**
 * @typedef {object} PatchronContext
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
 * @typedef {object} MultiLineComment file review comment
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
 * @typedef {object} SingleLineComment file review comment
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

/**
 * @typedef {object} MultiLineOption
 * @property {Indicator} indicator multi-line start condition.
 * @property {Limiter} limiter multi-line end condition.
 */

/**
 * @typedef {object} Indicator
 * @property {string} [startsWith]
 * @property {string} [notStartsWith]
 * @property {string} [endsWith]
 * @property {string} [notEndsWith]
 * @property {string} [includes]
 * @property {string} [notIncludes]
 * @property {any} [equals] uses `lodash` isEqual. Functions and DOM nodes are not supported.
 * @property {any} [notEquals] uses `lodash` isEqual. Functions and DOM nodes are not supported.
 * @property {object} [expression]
 * @property {string} [until] marks to take part of content if `until` appeared in the text. Can be used in combination with other property e.g. `includes -> until`
 */

/**
 * @typedef {object} Limiter
 * @property {string} [startsWith]
 * @property {string} [notStartsWith]
 * @property {string} [endsWith]
 * @property {string} [notEndsWith]
 * @property {string} [includes]
 * @property {string} [notIncludes]
 * @property {any} [equals] uses `lodash` isEqual. Functions and DOM nodes are not supported.
 * @property {any} [notEquals] uses `lodash` isEqual. Functions and DOM nodes are not supported.
 * @property {object} [expression]
 * @property {string} [nextLine]
 * @property {string} [until] marks to take part of content if `until` appeared in the text. Can be used in combination with other property.
 * @property {Array<object>|string} [indentation] includes `indentation` filter. Can be used in combination with other property.
 *
 * - To refer to `indicator` indentation, use following `string` syntax:
 * ```js
 * indentation: '{operator}-indicator'
 * // eg. indentation: 'eq-indicator'
 * ```
 *
 * - To pass custom value, use `array` syntax:
 * ```js
 * indentation: [operator, value]
 * // eg. indentation: ['gt', 5]
 * ```
 *
 * operator can be one of the following: gt, ge, lt, le, eq
 */
