/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs"
        }
      }
    ]
  },
  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/tests/styleMock.ts"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: ["**/tests/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"]
};
