module.exports = (text, character) => {
    let occurences = 0;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === character) {
            occurences++;
        }
    }

    return occurences;
};
