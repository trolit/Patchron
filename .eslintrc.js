module.exports = {
    root: true,

    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },

    extends: ['eslint:recommended', 'prettier'],

    env: {
        es2021: true,
        node: true
    },

    rules: {
        'consistent-return': 'error',
        'no-console': 'warn',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unreachable-loop': 'error',
        'no-alert': 'error',
        'no-bitwise': ['error', { allow: ['~'] }],
        'no-empty': 'error',
        'no-implicit-globals': ['error'],
        'no-inline-comments': 'error',
        'no-mixed-operators': 'error',
        'no-multi-assign': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'require-await': 'error',
        'no-invalid-this': 'error'
    }
};
