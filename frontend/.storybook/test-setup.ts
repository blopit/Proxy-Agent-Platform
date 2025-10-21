// Mock global objects that might be used in components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
  writable: true,
});

// Mock SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = 'en-US';
    
    start() {
      setTimeout(() => {
        const event = new Event('result');
        (event as any).results = [[{ transcript: 'Mock speech input' }]];
        this.dispatchEvent(event);
      }, 100);
    }
    
    stop() {}
    abort() {}
    addEventListener() {}
    dispatchEvent() {}
  },
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: class MockWebkitSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = 'en-US';
    
    start() {
      setTimeout(() => {
        const event = new Event('result');
        (event as any).results = [[{ transcript: 'Mock speech input' }]];
        this.dispatchEvent(event);
      }, 100);
    }
    
    stop() {}
    abort() {}
    addEventListener() {}
    dispatchEvent() {}
  },
});
