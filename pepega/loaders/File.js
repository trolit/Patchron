const RulesLoader = require('./Rules');

class FileLoader {
    constructor(file) {
        return new RulesLoader(file);
    }
}

module.exports = FileLoader;
