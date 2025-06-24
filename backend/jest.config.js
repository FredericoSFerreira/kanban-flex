export default {
  testEnvironment: 'node',
  verbose: true,
  setupFiles: ['./jest.globals.js'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'modules/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};
