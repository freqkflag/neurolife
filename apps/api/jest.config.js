/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  forceExit: true,
  moduleNameMapper: {
    '^@neurolife/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};
