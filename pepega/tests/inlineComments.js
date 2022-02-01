module.exports = () => {
    const x = 2; /* here I have x = 2 */

    if (x) {
        const result = x * 5; // TODO: fix it!

        console.log(result); // TMP: ok?
    }

    console.log('egg'); // this is deprecated!
};
