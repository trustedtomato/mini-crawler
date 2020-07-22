const { join } = require('path')

module.exports = {
  rootDir: join(__dirname, 'built'),
  // only test JavaScript files
  testMatch: [ "**/__tests__/**/*.js", "**/?(*.)+(spec|test).js" ],
  coverageDirectory: join(__dirname, 'coverage'),
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
}