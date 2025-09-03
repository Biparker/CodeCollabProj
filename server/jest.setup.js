// Global test setup
beforeEach(() => {
  // Clear any cached modules between tests
  jest.clearAllMocks();
});

// Suppress console.log during tests unless explicitly testing it
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});
