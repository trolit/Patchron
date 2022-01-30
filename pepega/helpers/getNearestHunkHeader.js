/**
 * returns nearest **hunk data**
 * @param {Array<string>} split_content array including code
 * @param {number} row_number index of current loop iteration.
 *
 * @link https://www.edureka.co/community/7949/what-are-these-in-github
 *
 * @example (a) = @
 * ┌─────────┬───────────────────────────────┐
 * │ (index) │            Values             │
 * ├─────────┼───────────────────────────────┤
 * │    0    │  '(a)(a) -0,0 +1,33 (a)(a)'   │
 * │    1    │ '+// SIMPLE "FLAVOUR" TESTS'  │
 * │    2    │              '+'              │
 * │    3    │ '+ // breakline above return' │
 * │    4    │    '+ function test1() {'     │
 * │    5    │    '+    const w = 2;   '     │
 * │    6    │       '+    return w;'        │
 * │    7    │              '}'              │
 * └─────────┴───────────────────────────────┘
 *
 * {
 *  hunk_position: 0,
 *  source_file: { start_line: '0', hunk_length: '0' },
 *  modified_file: { start_line: '1', hunk_length: '33' }
 * }
 *
 * @returns {object}
 */
module.exports = (split_content, row_number) => {
    let result = null;

    if (!Array.isArray(split_content) || !row_number) {
        probotInstance.log.warn(
            `Invalid data passed to the function -> ${__filename}`
        );

        return result;
    }

    for (let i = row_number; i >= 0; i--) {
        const row_content = split_content[i];

        if (row_content.startsWith('@@')) {
            const split_row_content = row_content.split(' ');

            if (split_row_content.length < 3) {
                return result;
            }

            const source_file_data = split_row_content[1].split(/[-,]/);
            const modified_file_data = split_row_content[2].split(/[+,]/);

            result = {
                hunk_position: i,
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
