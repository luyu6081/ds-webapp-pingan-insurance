module.exports = {
  root: true,
  env: {
    node: true,
  },
  'extends': [
    '@vue/standard',
    '@ej/eslint-config',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: [
    'graphql',
  ],
}
