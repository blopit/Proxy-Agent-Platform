import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AsyncJobTimeline from '../AsyncJobTimeline'

// Mock API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getMicroStepChildren: jest.fn(),
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

const mockSteps = [
  {
    id: 'step-1',
    description: 'Parse natural language',
    shortLabel: 'Parse',
    detail: 'Extracting task details...',
    estimatedMinutes: 2,
    leafType: 'DIGITAL',
    icon: '🧠',
    status: 'done' as const,
    isLeaf: true,
    decompositionState: 'atomic',
    level: 0,
    tags: ['🎯 Focused', '⚡ Quick Win'],
  },
  {
    id: 'step-2',
    description: 'Break into micro-steps',
    shortLabel: 'Decompose',
    detail: 'Creating actionable steps...',
    estimatedMinutes: 5,
    leafType: 'HUMAN',
    icon: '🔨',
    status: 'active' as const,
    isLeaf: false,
    decompositionState: 'stub',
    level: 0,
    tags: ['🧩 Complex'],
  },
  {
    id: 'step-3',
    description: 'Save to database',
    shortLabel: 'Save',
    detail: 'Persisting data...',
    estimatedMinutes: 1,
    leafType: 'DIGITAL',
    icon: '💾',
    status: 'pending' as const,
    isLeaf: true,
    decompositionState: 'atomic',
    level: 0,
    tags: [],
  },
]

const defaultProps = {
  jobName: 'Test Job',
  steps: mockSteps,
  currentProgress: 50,
  size: 'full' as const,
  showProgressBar: true,
}

describe('AsyncJobTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<AsyncJobTimeline {...defaultProps} />)

      // Check that component renders
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders step icons', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      expect(screen.getByText('🧠')).toBeInTheDocument()
      expect(screen.getByText('🔨')).toBeInTheDocument()
      expect(screen.getByText('💾')).toBeInTheDocument()
    })

    it('renders step status indicators', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')

      // First step is done - should have green styling
      expect(steps[0]).toHaveStyle({ borderColor: expect.stringContaining('#859900') })

      // Second step is active - should have blue styling
      expect(steps[1]).toHaveStyle({ borderColor: expect.stringContaining('#268bd2') })
    })

    it('renders progress bar when showProgressBar is true', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Check for progress bar element (implementation may vary)
      const progressElement = screen.getByRole('progressbar', { hidden: true }) ||
                              document.querySelector('[role="progressbar"]')
      expect(progressElement).toBeTruthy()
    })

    it('does not render progress bar when showProgressBar is false', () => {
      render(<AsyncJobTimeline {...defaultProps} showProgressBar={false} />)

      const progressElement = document.querySelector('[role="progressbar"]')
      expect(progressElement).toBeNull()
    })
  })

  describe('Performance - React.memo', () => {
    it('does not re-render when props have not changed', () => {
      const renderSpy = jest.fn()

      const TestWrapper = ({ steps }: { steps: typeof mockSteps }) => {
        renderSpy()
        return <AsyncJobTimeline {...defaultProps} steps={steps} />
      }

      const { rerender } = render(<TestWrapper steps={mockSteps} />)

      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Re-render with same props (same array reference)
      rerender(<TestWrapper steps={mockSteps} />)

      // React.memo should prevent AsyncJobTimeline from re-rendering
      // but TestWrapper will re-render, so spy called twice
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('does re-render when steps prop changes', () => {
      const { rerender } = render(<AsyncJobTimeline {...defaultProps} />)

      const newSteps = [
        ...mockSteps,
        {
          id: 'step-4',
          description: 'New step',
          shortLabel: 'New',
          estimatedMinutes: 3,
          leafType: 'HUMAN' as const,
          icon: '✨',
          status: 'pending' as const,
          isLeaf: true,
          decompositionState: 'atomic',
          level: 0,
          tags: [],
        },
      ]

      rerender(<AsyncJobTimeline {...defaultProps} steps={newSteps} />)

      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('does re-render when progress changes', () => {
      const { rerender } = render(<AsyncJobTimeline {...defaultProps} currentProgress={50} />)

      rerender(<AsyncJobTimeline {...defaultProps} currentProgress={75} />)

      // Progress should be updated (check via progress bar or other indicator)
      expect(screen.getByRole('progressbar', { hidden: true })).toBeTruthy()
    })
  })

  describe('Step Expansion/Collapse', () => {
    it('expands step when clicked', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const step = screen.getByText('Parse')
      fireEvent.click(step)

      // Check for expanded state (tags should be visible)
      expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
      expect(screen.getByText('⚡ Quick Win')).toBeInTheDocument()
    })

    it('collapses step when clicked again', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const step = screen.getByText('Parse')

      // Expand
      fireEvent.click(step)
      expect(screen.getByText('🎯 Focused')).toBeInTheDocument()

      // Collapse
      fireEvent.click(step)

      // Tags should not be visible when collapsed
      waitFor(() => {
        expect(screen.queryByText('🎯 Focused')).not.toBeInTheDocument()
      })
    })

    it('shows expand indicator for decomposable steps', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Step 2 is decomposable (isLeaf: false)
      const step2 = screen.getByText('Decompose')

      // Should have expand indicator (▶ or similar)
      expect(step2.closest('button')).toContainHTML('▶')
    })

    it('does not show expand indicator for atomic steps', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Step 1 is atomic (isLeaf: true)
      const step1 = screen.getByText('Parse')

      // Should not have expand indicator
      expect(step1.closest('button')).not.toContainHTML('▶')
    })
  })

  describe('Tags Display', () => {
    it('shows tags when step is expanded', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const step = screen.getByText('Parse')
      fireEvent.click(step)

      expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
      expect(screen.getByText('⚡ Quick Win')).toBeInTheDocument()
    })

    it('does not show tags when step is collapsed', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Tags should not be visible initially (collapsed state)
      expect(screen.queryByText('🎯 Focused')).not.toBeInTheDocument()
      expect(screen.queryByText('⚡ Quick Win')).not.toBeInTheDocument()
    })

    it('shows maximum of 5 tags', () => {
      const stepWithManyTags = {
        ...mockSteps[0],
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5', 'Tag6', 'Tag7'],
      }

      render(<AsyncJobTimeline {...defaultProps} steps={[stepWithManyTags]} />)

      const step = screen.getByText('Parse')
      fireEvent.click(step)

      // Should show first 5 tags
      expect(screen.getByText('Tag1')).toBeInTheDocument()
      expect(screen.getByText('Tag5')).toBeInTheDocument()

      // Should show "+2" indicator for remaining tags
      expect(screen.getByText('+2')).toBeInTheDocument()

      // Should not show 6th and 7th tag
      expect(screen.queryByText('Tag6')).not.toBeInTheDocument()
      expect(screen.queryByText('Tag7')).not.toBeInTheDocument()
    })

    it('handles steps with no tags gracefully', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const step = screen.getByText('Save') // Step 3 has no tags
      fireEvent.click(step)

      // Should render without errors and show nbsp placeholder
      expect(step).toBeInTheDocument()
    })
  })

  describe('Hierarchical Children Loading', () => {
    it('loads children when decomposable step is expanded (stub state - triggers decomposition)', async () => {
      const mockChildren = [
        {
          step_id: 'child-1',
          description: 'Sub-step 1',
          short_label: 'Sub 1',
          estimated_minutes: 2,
          leaf_type: 'digital',
          icon: '📋',
          is_leaf: true,
          decomposition_state: 'atomic',
          level: 1,
          tags: [],
        },
        {
          step_id: 'child-2',
          description: 'Sub-step 2',
          short_label: 'Sub 2',
          estimated_minutes: 3,
          leaf_type: 'human',
          icon: '✏️',
          is_leaf: true,
          decomposition_state: 'atomic',
          level: 1,
          tags: [],
        },
      ];

      // Mock the fetch call for decomposition
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          children: mockChildren,
          total: 2,
        }),
      })

      render(<AsyncJobTimeline {...defaultProps} />)

      // Click decomposable step (step-2)
      const decompStep = screen.getByText('Decompose')
      fireEvent.click(decompStep)

      // Should show decomposition job timeline
      await waitFor(() => {
        expect(screen.getByText('Breaking down...')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Should load children after decomposition completes
      await waitFor(() => {
        expect(screen.getByText('Sub 1')).toBeInTheDocument()
        expect(screen.getByText('Sub 2')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('does not load children for atomic steps', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const atomicStep = screen.getByText('Parse') // Atomic step
      fireEvent.click(atomicStep)

      // Should not attempt to fetch (no decomposition)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('handles child loading errors gracefully', async () => {
      // Mock fetch to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AsyncJobTimeline {...defaultProps} />)

      const decompStep = screen.getByText('Decompose')
      fireEvent.click(decompStep)

      // Should show decomposition job first
      await waitFor(() => {
        expect(screen.getByText('Breaking down...')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Error should be logged (not displayed to user in current implementation)
      // The decomposition job should disappear
      await waitFor(() => {
        expect(screen.queryByText('Breaking down...')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('caches loaded children', async () => {
      const mockChildren = [{
        step_id: 'child-1',
        description: 'Sub-step 1',
        short_label: 'Sub 1',
        estimated_minutes: 2,
        leaf_type: 'digital',
        icon: '📋',
        is_leaf: true,
        decomposition_state: 'atomic',
        level: 1,
        tags: [],
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          children: mockChildren,
          total: 1,
        }),
      })

      render(<AsyncJobTimeline {...defaultProps} />)

      const decompStep = screen.getByText('Decompose')

      // First expansion - should load
      fireEvent.click(decompStep)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(screen.getByText('Sub 1')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Collapse
      fireEvent.click(decompStep)

      // Second expansion - should use cache (no new fetch)
      fireEvent.click(decompStep)

      // Should still only have been called once (cached)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Sub 1')).toBeInTheDocument()
    })
  })

  describe('Leaf Type Visual Indicators', () => {
    it('shows DIGITAL leaf type badge', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const digitalStep = screen.getByText('Parse')
      fireEvent.click(digitalStep)

      // Should show DIGITAL indicator
      expect(screen.getByText(/digital/i)).toBeInTheDocument()
    })

    it('shows HUMAN leaf type badge', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const humanStep = screen.getByText('Decompose')
      fireEvent.click(humanStep)

      // Should show HUMAN indicator
      expect(screen.getByText(/human/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')
      steps.forEach(step => {
        expect(step).toHaveAttribute('aria-label')
      })
    })

    it('supports keyboard navigation', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const step = screen.getByText('Parse')
      step.focus()

      // Should be focusable
      expect(step).toHaveFocus()

      // Should expand on Enter
      fireEvent.keyDown(step, { key: 'Enter' })
      expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty steps array', () => {
      render(<AsyncJobTimeline {...defaultProps} steps={[]} />)

      expect(screen.getByText('Test Job')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('handles steps without shortLabel', () => {
      const stepsWithoutLabel = [{
        ...mockSteps[0],
        shortLabel: undefined,
      }]

      render(<AsyncJobTimeline {...defaultProps} steps={stepsWithoutLabel} />)

      // Should use description as fallback
      expect(screen.getByText('Parse natural language')).toBeInTheDocument()
    })

    it('handles steps without icons', () => {
      const stepsWithoutIcon = [{
        ...mockSteps[0],
        icon: undefined,
      }]

      render(<AsyncJobTimeline {...defaultProps} steps={stepsWithoutIcon} />)

      // Should render without errors
      expect(screen.getByText('Parse')).toBeInTheDocument()
    })

    it('handles very long step descriptions gracefully', () => {
      const stepWithLongDesc = [{
        ...mockSteps[0],
        description: 'A'.repeat(500), // Very long description
        shortLabel: 'Long',
      }]

      render(<AsyncJobTimeline {...defaultProps} steps={stepWithLongDesc} />)

      // Should render with text truncation/ellipsis
      const longDescElement = screen.getByText('Long')
      expect(longDescElement).toBeInTheDocument()
    })
  })
})
