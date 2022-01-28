/**
 * returns nearest **hunk data**
 * @param {Array<string>} split_content array including code.
 * @param {number} current_row id of current loop iteration.
 *
 * @link https://www.edureka.co/community/7949/what-are-these-in-github
 *
 * @example
 * ┌─────────┬────────────┐
 * │ (index) │    Values  │
 * ├─────────┼────────────┤
 * │    0    │     '@@'   │
 * │    1    │   '-10,13' │
 * │    2    │   '+10,7'  │
 * │    3    │     '@@'   │
 * └─────────┴────────────┘
 * {
 *  source_file: { start_line: '10', hunk_length: '13' },
 *  modified_file: { start_line: '10', hunk_length: '7' }
 * }
 *
 * @returns {object}
 */
module.exports = (split_content, current_row) => {
    let result = null;

    if (!Array.isArray(split_content) || !current_row) {
        probotInstance.log.warn(
            `Invalid data passed to the function -> ${__filename}`
        );

        return result;
    }

    for (let i = current_row; i > 0; i--) {
        const row_content = split_content[current_row];

        if (row_content.startsWith('@@')) {
            const split_row_content = row_content.split(' ');

            if (split_row_content.length < 3) {
                return result;
            }

            const source_file_data = split_row_content[1].split(/[-,]/);
            const modified_file_data = split_row_content[2].split(/[+,]/);

            result = {
                source_file: {
                    start_line: source_file_data[1],
                    hunk_length: source_file_data[2],
                },
                modified_file: {
                    start_line: modified_file_data[1],
                    hunk_length: modified_file_data[2],
                },
            };

            break;
        }
    }

    return result;
};
