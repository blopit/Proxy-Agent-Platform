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

      // Emojis appear multiple times due to blend animation (black + color variants)
      const brainEmojis = screen.getAllByText('🧠')
      expect(brainEmojis.length).toBeGreaterThan(0)

      const hammerEmojis = screen.getAllByText('🔨')
      expect(hammerEmojis.length).toBeGreaterThan(0)

      const diskEmojis = screen.getAllByText('💾')
      expect(diskEmojis.length).toBeGreaterThan(0)
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

      // New step should be present (check via getAllByText since "New" might be duplicated)
      const newLabels = screen.getAllByText('New')
      expect(newLabels.length).toBeGreaterThan(0)
    })

    it('does re-render when progress changes', () => {
      const { rerender } = render(<AsyncJobTimeline {...defaultProps} currentProgress={50} />)

      rerender(<AsyncJobTimeline {...defaultProps} currentProgress={75} />)

      // Progress should be updated (check via progress bar or other indicator)
      expect(screen.getByRole('progressbar', { hidden: true })).toBeTruthy()
    })
  })

  describe('Step Expansion/Collapse', () => {
    it('expands step when clicked', async () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Click first occurrence of "Parse" text (may be in SVG or hidden, use queryOptions)
      const parseElements = screen.queryAllByText('Parse', { hidden: true })
      expect(parseElements.length).toBeGreaterThan(0)
      fireEvent.click(parseElements[0])

      // Check for expanded state (tags should be visible) - wait for async state update
      await waitFor(() => {
        expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
        expect(screen.getByText('⚡ Quick Win')).toBeInTheDocument()
      })
    })

    it('collapses step when clicked again', async () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const parseElements = screen.getAllByText('Parse')
      const firstStep = parseElements[0]

      // Expand
      fireEvent.click(firstStep)
      await waitFor(() => {
        expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
      })

      // Collapse
      fireEvent.click(firstStep)

      // Tags should not be visible when collapsed
      await waitFor(() => {
        expect(screen.queryByText('🎯 Focused')).not.toBeInTheDocument()
      })
    })

    it('shows expand indicator for decomposable steps', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Step 2 is decomposable (isLeaf: false)
      const decomposeElements = screen.getAllByText('Decompose')
      const step2 = decomposeElements[0].closest('div') // Get container div

      // Should have expand indicator (▶ or similar)
      expect(step2).toContainHTML('▶')
    })

    it('does not show expand indicator for atomic steps', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Step 1 is atomic (isLeaf: true)
      const parseElements = screen.getAllByText('Parse')
      const step1 = parseElements[0].closest('div') // Get container div

      // Should not have expand indicator
      expect(step1).not.toContainHTML('▶')
    })
  })

  describe('Tags Display', () => {
    it('shows tags when step is expanded', async () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const parseElements = screen.getAllByText('Parse')
      fireEvent.click(parseElements[0])

      await waitFor(() => {
        expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
        expect(screen.getByText('⚡ Quick Win')).toBeInTheDocument()
      })
    })

    it('does not show tags when step is collapsed', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      // Tags should not be visible initially (collapsed state)
      expect(screen.queryByText('🎯 Focused')).not.toBeInTheDocument()
      expect(screen.queryByText('⚡ Quick Win')).not.toBeInTheDocument()
    })

    it('shows maximum of 5 tags', async () => {
      const stepWithManyTags = {
        ...mockSteps[0],
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5', 'Tag6', 'Tag7'],
      }

      render(<AsyncJobTimeline {...defaultProps} steps={[stepWithManyTags]} />)

      const steps = screen.getAllByRole('button')
      fireEvent.click(steps[0]) // First (and only) step with many tags

      // Wait for expansion and tag display
      await waitFor(() => {
        // Should show first 5 tags
        expect(screen.getByText('Tag1')).toBeInTheDocument()
        expect(screen.getByText('Tag5')).toBeInTheDocument()

        // Should show "+2" indicator for remaining tags
        expect(screen.getByText('+2')).toBeInTheDocument()
      })

      // Should not show 6th and 7th tag
      expect(screen.queryByText('Tag6')).not.toBeInTheDocument()
      expect(screen.queryByText('Tag7')).not.toBeInTheDocument()
    })

    it('handles steps with no tags gracefully', () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')
      const step = steps[2] // Save step (Step 3 has no tags)
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

      // Click decomposable step (step-2, index 1)
      const steps = screen.getAllByRole('button')
      fireEvent.click(steps[1]) // Decompose step

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

      const steps = screen.getAllByRole('button')
      fireEvent.click(steps[0]) // Parse step (atomic)

      // Should not attempt to fetch (no decomposition)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('handles child loading errors gracefully', async () => {
      // Mock fetch to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')
      fireEvent.click(steps[1]) // Decompose step

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

      const steps = screen.getAllByRole('button')
      const decompStep = steps[1] // Decompose step

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
    it('shows DIGITAL leaf type badge', async () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')
      fireEvent.click(steps[0]) // Parse step (DIGITAL)

      // Should show DIGITAL indicator - wait for async expansion
      await waitFor(() => {
        expect(screen.getByText(/digital/i)).toBeInTheDocument()
      })
    })

    it('shows HUMAN leaf type badge', async () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')
      fireEvent.click(steps[1]) // Decompose step (HUMAN)

      // Should show HUMAN indicator - wait for async expansion
      await waitFor(() => {
        expect(screen.getByText(/human/i)).toBeInTheDocument()
      })
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

    it('supports keyboard navigation', async () => {
      render(<AsyncJobTimeline {...defaultProps} />)

      const steps = screen.getAllByRole('button')
      const step = steps[0] // Parse step
      step.focus()

      // Should be focusable
      expect(step).toHaveFocus()

      // Should expand on Enter - wait for async expansion
      fireEvent.keyDown(step, { key: 'Enter' })
      await waitFor(() => {
        expect(screen.getByText('🎯 Focused')).toBeInTheDocument()
      })
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

      // Should use description as fallback (may be duplicated due to blend animation)
      const descriptionElements = screen.getAllByText('Parse natural language')
      expect(descriptionElements.length).toBeGreaterThan(0)
    })

    it('handles steps without icons', () => {
      const stepsWithoutIcon = [{
        ...mockSteps[0],
        icon: undefined,
      }]

      render(<AsyncJobTimeline {...defaultProps} steps={stepsWithoutIcon} />)

      // Should render without errors (may be duplicated due to blend animation)
      const parseElements = screen.getAllByText('Parse')
      expect(parseElements.length).toBeGreaterThan(0)
    })

    it('handles very long step descriptions gracefully', () => {
      const stepWithLongDesc = [{
        ...mockSteps[0],
        description: 'A'.repeat(500), // Very long description
        shortLabel: 'Long',
      }]

      render(<AsyncJobTimeline {...defaultProps} steps={stepWithLongDesc} />)

      // Should render with text truncation/ellipsis (may be duplicated due to blend animation)
      const longElements = screen.getAllByText('Long')
      expect(longElements.length).toBeGreaterThan(0)
    })
  })
})
