import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskBreakdownModal from '../modals/TaskBreakdownModal';
import type { CaptureResponse } from '@/types/capture';
import { taskApi } from '@/services/taskApi';

// Mock the taskApi
jest.mock('@/services/taskApi', () => ({
  taskApi: {
    breakDownTask: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockCaptureResponse: CaptureResponse = {
  task: {
    task_id: 'task-123',
    title: 'Set up smart AC automation',
    description: 'Automatically turn off AC when leaving home',
    status: 'pending',
    priority: 'medium',
    tags: ['🏠 Home', '🤖 Automation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_hours: 0.25,
  },
  micro_steps: [
    {
      step_id: 'step-1',
      description: 'Research smart plug options',
      short_label: 'Research',
      estimated_minutes: 5,
      total_minutes: 5,
      leaf_type: 'HUMAN',
      icon: '🔍',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['🎯 Focused'],
    },
    {
      step_id: 'step-2',
      description: 'Set up IFTTT geofence trigger',
      short_label: 'Setup geofence',
      estimated_minutes: 7,
      total_minutes: 7,
      leaf_type: 'DIGITAL',
      icon: '🌍',
      is_leaf: false,
      decomposition_state: 'stub',
      level: 5,
      tags: ['🤖 Auto', '🧩 Complex'],
    },
    {
      step_id: 'step-3',
      description: 'Test automation when leaving',
      short_label: 'Test',
      estimated_minutes: 3,
      total_minutes: 3,
      leaf_type: 'HUMAN',
      icon: '🧪',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['⚡ Quick Win'],
    },
  ],
  breakdown: {
    total_steps: 3,
    total_minutes: 15,
    digital_count: 1,
    human_count: 2,
  },
  processing_time_ms: 8234,
  needs_clarification: false,
  clarifications: [],
};

const mockDecompositionResponse = {
  subtasks: [
    {
      task_id: 'step-2-child-1',
      title: 'Configure IFTTT account',
      description: 'Set up IFTTT account and permissions',
      estimated_minutes: 3,
      total_minutes: 3,
      leaf_type: 'HUMAN',
      icon: '⚙️',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
    },
    {
      task_id: 'step-2-child-2',
      title: 'Create geofence boundary',
      description: 'Define geographic boundary for trigger',
      estimated_minutes: 2,
      total_minutes: 2,
      leaf_type: 'HUMAN',
      icon: '📍',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
    },
    {
      task_id: 'step-2-child-3',
      title: 'Link smart plug device',
      description: 'Connect smart plug to automation',
      estimated_minutes: 2,
      total_minutes: 2,
      leaf_type: 'DIGITAL',
      icon: '🔗',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
    },
  ],
};

describe('TaskBreakdownModal', () => {
  const mockOnClose = jest.fn();
  const mockOnStartTask = jest.fn();
  const mockOnViewAllTasks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders when open', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
          onStartTask={mockOnStartTask}
          onViewAllTasks={mockOnViewAllTasks}
        />
      );

      expect(screen.getByText('Task Captured Successfully!')).toBeInTheDocument();
      expect(screen.getByText(/3 actionable steps/)).toBeInTheDocument();
      expect(screen.getByText(/8234ms/)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const { container } = render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('shows processing time', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/8234ms/)).toBeInTheDocument();
    });

    it('shows breakdown statistics', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Digital vs Human counts
      expect(screen.getByText(/1 ⚡/)).toBeInTheDocument(); // 1 digital
      expect(screen.getByText(/2 🎯/)).toBeInTheDocument(); // 2 human
    });
  });

  describe('View Toggle', () => {
    it('starts in card view by default', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('📋 Card View')).toBeInTheDocument();
      expect(screen.getByText('🌳 Tree View')).toBeInTheDocument();
    });

    it('switches to tree view when clicked', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Should show hierarchy breakdown
      expect(screen.getByText('Hierarchy Breakdown')).toBeInTheDocument();
    });
  });

  describe('Decomposition Flow', () => {
    it('shows decompose button for stub nodes', async () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Should show decompose button for step-2 (stub state)
      await waitFor(() => {
        expect(screen.getByText('🔨')).toBeInTheDocument();
        expect(screen.getByText('Decompose')).toBeInTheDocument();
      });
    });

    it('does not show decompose button for atomic nodes', async () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Atomic steps (step-1 and step-3) should have "Start" button, not "Decompose"
      await waitFor(() => {
        const decomposeButtons = screen.queryAllByText('Decompose');
        // Only one decompose button (for step-2)
        expect(decomposeButtons).toHaveLength(1);
      });
    });

    it('calls API when decompose button is clicked', async () => {
      (taskApi.breakDownTask as jest.Mock).mockResolvedValueOnce(mockDecompositionResponse);

      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Find and click decompose button
      await waitFor(() => {
        const decomposeButton = screen.getByText('Decompose');
        fireEvent.click(decomposeButton);
      });

      // Should call API
      await waitFor(() => {
        expect(taskApi.breakDownTask).toHaveBeenCalledWith('step-2');
      });
    });

    it('shows AsyncJobTimeline during decomposition', async () => {
      (taskApi.breakDownTask as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockDecompositionResponse), 1000))
      );

      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Click decompose button
      await waitFor(() => {
        const decomposeButton = screen.getByText('Decompose');
        fireEvent.click(decomposeButton);
      });

      // Should show AsyncJobTimeline
      await waitFor(() => {
        expect(screen.getByText('Decomposing task...')).toBeInTheDocument();
      });

      // Should show decomposition steps
      await waitFor(() => {
        expect(screen.getByText(/Analyze complexity/)).toBeInTheDocument();
        expect(screen.getByText(/Break into subtasks/)).toBeInTheDocument();
        expect(screen.getByText(/Classify steps/)).toBeInTheDocument();
        expect(screen.getByText(/Save results/)).toBeInTheDocument();
      });
    });

    it('updates tree with new children after decomposition', async () => {
      (taskApi.breakDownTask as jest.Mock).mockResolvedValueOnce(mockDecompositionResponse);

      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Click decompose button
      await waitFor(() => {
        const decomposeButton = screen.getByText('Decompose');
        fireEvent.click(decomposeButton);
      });

      // Wait for decomposition to complete
      await waitFor(
        () => {
          expect(screen.getByText('Configure IFTTT account')).toBeInTheDocument();
          expect(screen.getByText('Create geofence boundary')).toBeInTheDocument();
          expect(screen.getByText('Link smart plug device')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('handles decomposition errors gracefully', async () => {
      (taskApi.breakDownTask as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const toast = await import('react-hot-toast');

      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Click decompose button
      await waitFor(() => {
        const decomposeButton = screen.getByText('Decompose');
        fireEvent.click(decomposeButton);
      });

      // Should show error toast
      await waitFor(() => {
        expect(toast.default.error).toHaveBeenCalledWith('Failed to decompose task. Please try again.');
      });
    });

    it('disables decompose button during decomposition', async () => {
      (taskApi.breakDownTask as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockDecompositionResponse), 2000))
      );

      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Switch to tree view
      const treeViewButton = screen.getByText('🌳 Tree View');
      fireEvent.click(treeViewButton);

      // Click decompose button
      let decomposeButton: HTMLElement;
      await waitFor(() => {
        decomposeButton = screen.getByText('Decompose');
        fireEvent.click(decomposeButton);
      });

      // Button should be disabled and show "Decomposing..."
      await waitFor(() => {
        expect(screen.getByText('Decomposing...')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('calls onStartTask when Start First Step is clicked', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
          onStartTask={mockOnStartTask}
        />
      );

      const startButton = screen.getByText('Start First Step');
      fireEvent.click(startButton);

      expect(mockOnStartTask).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onViewAllTasks when View All is clicked', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
          onViewAllTasks={mockOnViewAllTasks}
        />
      );

      const viewAllButton = screen.getByText('View All');
      fireEvent.click(viewAllButton);

      expect(mockOnViewAllTasks).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Close button is clicked', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButtons = screen.getAllByText('Close');
      fireEvent.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when X button is clicked', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Clarifications', () => {
    it('shows clarification questions when needed', () => {
      const responseWithClarifications: CaptureResponse = {
        ...mockCaptureResponse,
        needs_clarification: true,
        clarifications: [
          {
            field: 'smart_plug_brand',
            question: 'Which smart plug brand do you prefer?',
            options: ['TP-Link', 'Wemo', 'Amazon Smart Plug'],
          },
        ],
      };

      render(
        <TaskBreakdownModal
          captureResponse={responseWithClarifications}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Additional Information Needed')).toBeInTheDocument();
      expect(screen.getByText(/Which smart plug brand do you prefer?/)).toBeInTheDocument();
      expect(screen.getByText('TP-Link')).toBeInTheDocument();
      expect(screen.getByText('Wemo')).toBeInTheDocument();
      expect(screen.getByText('Amazon Smart Plug')).toBeInTheDocument();
    });

    it('does not show clarifications section when not needed', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Additional Information Needed')).not.toBeInTheDocument();
    });
  });

  describe('Voice Input Indicator', () => {
    it('shows voice indicator when voice was used', () => {
      const responseWithVoice: CaptureResponse = {
        ...mockCaptureResponse,
        voice_processed: true,
      };

      render(
        <TaskBreakdownModal
          captureResponse={responseWithVoice}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Voice')).toBeInTheDocument();
    });
  });

  describe('Location Capture', () => {
    it('shows location indicator when location was captured', () => {
      const responseWithLocation: CaptureResponse = {
        ...mockCaptureResponse,
        location_captured: true,
      };

      render(
        <TaskBreakdownModal
          captureResponse={responseWithLocation}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Captured')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing callback functions gracefully', () => {
      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should render without errors even when optional callbacks are missing
      expect(screen.getByText('Task Captured Successfully!')).toBeInTheDocument();
    });

    it('handles null captureResponse', () => {
      const { container } = render(
        <TaskBreakdownModal
          captureResponse={null}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should not render when captureResponse is null
      expect(container.firstChild).toBeNull();
    });

    it('handles empty micro_steps array', () => {
      const emptyResponse: CaptureResponse = {
        ...mockCaptureResponse,
        micro_steps: [],
        breakdown: {
          total_steps: 0,
          total_minutes: 0,
          digital_count: 0,
          human_count: 0,
        },
      };

      render(
        <TaskBreakdownModal
          captureResponse={emptyResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/0 actionable steps/)).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('shows celebration animation on mount', async () => {
      jest.useFakeTimers();

      render(
        <TaskBreakdownModal
          captureResponse={mockCaptureResponse}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Celebration should be visible initially
      expect(screen.getByText('✅')).toBeInTheDocument();

      // Fast-forward past celebration duration
      jest.advanceTimersByTime(1500);

      // Celebration should disappear
      await waitFor(() => {
        expect(screen.queryByText('✅')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
