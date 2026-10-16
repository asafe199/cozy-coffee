module.exports = {
  projects: [
    {
      displayName: 'logic-tests',
      testMatch: ['<rootDir>/src/state/gameStore.test.ts', '<rootDir>/src/game/orders.test.ts', '<rootDir>/src/game/review.test.ts', '<rootDir>/src/scenes/CoffeeStation/dropZones.test.ts', '<rootDir>/src/scenes/shared/dragSway.test.ts'],
      preset: 'jest-expo',
      testEnvironment: 'node',
    },
    {
      displayName: 'react-tests',
      testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.test.tsx', '!<rootDir>/src/state/gameStore.test.ts'],
      preset: 'jest-expo',
      setupFiles: ['./jest.setup.js'],
    },
  ],
};
