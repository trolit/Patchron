/**
 * returns line number of current row (single line comments only)
 * @param {string} start_line start_line of **source_file** or **modified_file** hunk header
 * @param {number} row_number
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
 * => 15 (start_line) + 2 (row_number) - 1 = 16
 *
 * @returns {number}
 */
module.exports = (start_line, row_number) => {
    return parseInt(start_line) + row_number - 1;
};
