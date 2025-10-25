// Mock global objects that might be used in components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
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
global.fetch = (() => Promise.resolve({
  ok: true,
  status: 200,
  json: async () => ({}),
  text: async () => '',
})) as any;

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: () => {},
    watchPosition: () => 0,
    clearWatch: () => {},
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
