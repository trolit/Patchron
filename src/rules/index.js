const requireDirectory = require('require-directory');

const rules = requireDirectory(module, {
    exclude: /.*(Base|review).js/,
    rename: (name) => {
        const firstCharacter = name.charAt(0);

        return firstCharacter === firstCharacter.toLowerCase()
            ? name
            : `${name}Rule`;
    }
});

module.exports = rules;
