import '@testing-library/jest-dom'

// Mock framer-motion to avoid issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    input: ({ children, ...props }) => <input {...props}>{children}</input>,
    textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Reset fetch mock before each test
beforeEach(() => {
  fetch.mockClear()
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(() => []),
}))

// Mock Web Speech API
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onerror: null,
  onend: null,
  onresult: null,
  onstart: null,
}))

global.webkitSpeechRecognition = global.SpeechRecognition

// Don't mock design-system - use the real one since we just fixed it

// Mock OpenMoji component (renders emoji as image, mock as text for testing)
jest.mock('@/components/shared/OpenMoji', () => {
  return function OpenMoji({ emoji, ...props }) {
    return <span data-testid="openmoji" {...props}>{emoji}</span>
  }
})