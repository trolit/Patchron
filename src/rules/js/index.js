const DirectImportRule = require('./DirectImport');
const SimpleComparisionRule = require('./SimpleComparision');
const AsynchronousPatternRule = require('./AsynchronousPattern');
const ImportWithoutExtensionRule = require('./ImportWithoutExtension');
const ImplicitIndexFileImportRule = require('./ImplicitIndexFileImport');
const SimplePropertyAssignmentRule = require('./SimplePropertyAssignment');

module.exports = {
    DirectImportRule,
    SimpleComparisionRule,
    AsynchronousPatternRule,
    ImportWithoutExtensionRule,
    ImplicitIndexFileImportRule,
    SimplePropertyAssignmentRule
};
