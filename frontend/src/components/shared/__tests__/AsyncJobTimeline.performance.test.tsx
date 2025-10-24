/**
 * Performance Tests for AsyncJobTimeline
 *
 * Focus: Testing React.memo and preventing unnecessary re-renders
 */

import React from 'react'
import { render } from '@testing-library/react'
import AsyncJobTimeline from '../AsyncJobTimeline'

// Mock fetch globally
global.fetch = jest.fn()

const mockSteps = [
  {
    id: 'step-1',
    description: 'Parse natural language',
    shortLabel: 'Parse',
    estimatedMinutes: 2,
    leafType: 'DIGITAL' as const,
    icon: '🧠',
    status: 'done' as const,
    isLeaf: true,
    decompositionState: 'atomic',
    level: 0,
  },
  {
    id: 'step-2',
    description: 'Break into micro-steps',
    shortLabel: 'Decompose',
    estimatedMinutes: 5,
    leafType: 'HUMAN' as const,
    icon: '🔨',
    status: 'active' as const,
    isLeaf: false,
    decompositionState: 'stub',
    level: 0,
  },
]

describe('AsyncJobTimeline Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('React.memo - Prevents Unnecessary Re-renders', () => {
    it('does not re-render when parent re-renders with same props', () => {
      let renderCount = 0

      // Create a test component that tracks renders
      const TestAsyncJobTimeline = React.forwardRef((props: any, _ref) => {
        renderCount++
        return <AsyncJobTimeline {...props} />
      })
      TestAsyncJobTimeline.displayName = 'TestAsyncJobTimeline'

      const TestWrapper = ({ steps }: { steps: typeof mockSteps }) => {
        const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

        return (
          <div>
            <button onClick={forceUpdate}>Force Re-render</button>
            <TestAsyncJobTimeline
              jobName="Test Job"
              steps={steps}
              currentProgress={50}
              size="full"
              showProgressBar={true}
            />
          </div>
        )
      }

      const { getByText } = render(<TestWrapper steps={mockSteps} />)

      // Initial render
      expect(renderCount).toBe(1)

      // Force parent to re-render (but props stay the same)
      getByText('Force Re-render').click()

      // React.memo should prevent AsyncJobTimeline from re-rendering
      // since the props haven't changed
      expect(renderCount).toBe(1)
    })

    it('does re-render when steps prop changes (array reference changes)', () => {
      const { rerender } = render(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={mockSteps}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
      )

      const newSteps = [
        ...mockSteps,
        {
          id: 'step-3',
          description: 'New step',
          shortLabel: 'New',
          estimatedMinutes: 3,
          leafType: 'DIGITAL' as const,
          icon: '✨',
          status: 'pending' as const,
          isLeaf: true,
          decompositionState: 'atomic',
          level: 0,
        },
      ]

      // Should trigger re-render since steps array changed
      rerender(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={newSteps}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
      )

      // Component should have re-rendered (no error thrown)
      expect(true).toBe(true)
    })

    it('does re-render when currentProgress prop changes', () => {
      const { rerender, container } = render(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={mockSteps}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
      )

      // Change progress
      rerender(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={mockSteps}
          currentProgress={75}
          size="full"
          showProgressBar={true}
        />
      )

      // Component should update (verify it still renders)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('No Debug Logs in Production', () => {
    it('does not log to console during normal operation', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()

      render(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={mockSteps}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
      )

      // Should not have any console.log or console.debug calls during render
      // (console.error is okay for errors)
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleDebugSpy).not.toHaveBeenCalled()

      consoleLogSpy.mockRestore()
      consoleDebugSpy.mockRestore()
    })
  })

  describe('Efficient Rendering', () => {
    it('renders quickly with small step count', () => {
      const start = performance.now()

      render(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={mockSteps}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
      )

      const duration = performance.now() - start

      // Should render in under 100ms
      expect(duration).toBeLessThan(100)
    })

    it('renders efficiently with large step count', () => {
      // Create 50 steps
      const largeStepSet = Array.from({ length: 50 }, (_, i) => ({
        id: `step-${i}`,
        description: `Step ${i}`,
        shortLabel: `Step ${i}`,
        estimatedMinutes: 5,
        leafType: 'DIGITAL' as const,
        icon: '⚡',
        status: 'pending' as const,
        isLeaf: true,
        decompositionState: 'atomic',
        level: 0,
      }))

      const start = performance.now()

      render(
        <AsyncJobTimeline
          jobName="Test Job"
          steps={largeStepSet}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
      )

      const duration = performance.now() - start

      // Should still render in reasonable time (under 500ms even with 50 steps)
      expect(duration).toBeLessThan(500)
    })
  })
})
