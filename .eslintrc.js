module.exports = {
    root: true,

    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },

    extends: ['eslint:recommended', 'prettier'],

    env: {
        es2021: true,
        node: true,
    },

    rules: {
        camelcase: ['error', { properties: 'never ' }],
        'consistent-return': 'error',
        'no-console': 'warn',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unreachable-loop': 'error',
        'no-use-before-define': 'error',
        'no-alert': 'error',
        'no-bitwise': 'error',
        'no-empty': 'error',
        'no-implicit-globals': ['error', { lexicalBindings: true }],
        'no-inline-comments': 'error',
        'no-magic-numbers': 'error',
        'no-mixed-operators': 'error',
        'no-multi-assign': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'require-await': 'error',
        'no-invalid-this': 'error',
    },
}
