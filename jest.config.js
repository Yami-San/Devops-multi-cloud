module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 60, // para pipeline de pruebas (ajusta en producción a 85)
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
