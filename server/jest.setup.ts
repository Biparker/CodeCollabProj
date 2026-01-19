// Global test setup

beforeEach((): void => {
  // Clear any cached modules between tests
  jest.clearAllMocks();
});

// Suppress console.log during tests unless explicitly testing it
const originalConsoleLog = console.log;

beforeAll((): void => {
  console.log = jest.fn();
});

afterAll((): void => {
  console.log = originalConsoleLog;
});
