/**
 * returns line number of current row according to hunk header
 * @param {string} startLine startLine of **source_file** or **modified_file** hunk header
 * @param {number} row
 *
 * @example
 * e.g. to get line number for row 2:
 * ┌─────────┬───────────────────────────────┐
 * │ (index) │            Values             │
 * ├─────────┼───────────────────────────────┤
 * │    0    │  '(a)(a) -0,0 +15,33 (a)(a)'  │
 * │    1    │     '+// SIMPLE TESTS'        │
 * │    2    │          '+// RR'             │
 * └─────────┴───────────────────────────────┘
 * => 15 (startLine) + 2 (row) - 1 = 16
 *
 * @returns {number}
 */
module.exports = (startLine, row) => {
    return parseInt(startLine) + row - 1;
};
