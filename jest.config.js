module.exports = {
  projects: [
    {
      displayName: 'logic-tests',
      testMatch: ['<rootDir>/src/state/gameStore.test.ts', '<rootDir>/src/game/orders.test.ts', '<rootDir>/src/game/review.test.ts', '<rootDir>/src/scenes/CoffeeStation/dropZones.test.ts', '<rootDir>/src/scenes/ToastStation/zones.test.ts', '<rootDir>/src/scenes/shared/dragSway.test.ts'],
      preset: 'jest-expo',
      testEnvironment: 'node',
    },
    {
      displayName: 'react-tests',
      testMatch: ['<rootDir>/**/*.test.tsx'],
      preset: 'jest-expo',
      setupFiles: ['./jest.setup.js'],
    },
  ],
};
