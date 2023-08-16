module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['./cypress/'],
  setupFiles: ['dotenv/config', 'jest-canvas-mock'],
  setupFilesAfterEnv: ['./src/setupTests.js'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^src(.*)$': '<rootDir>/src$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': require.resolve('axios'),
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
    '^.+\\.svg$': 'svg-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(somePkg)|react-dnd|dnd-core|@react-dnd)'],
};
