import type { Meta, StoryObj } from '@storybook/react';
import { QuickCapture } from './QuickCapture';
import { Task } from '@/types/task';

// Mock the taskApi
jest.mock('@/services/taskApi', () => ({
  taskApi: {
    quickCapture: jest.fn().mockResolvedValue({
      task: {
        id: '1',
        title: 'Test task',
        description: 'Test description',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user-1',
        priority: 'medium',
        tags: [],
        due_date: null,
        completed_at: null,
      },
      processing_time_ms: 1500,
    }),
  },
  TaskApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TaskApiError';
    }
  },
}));

const meta: Meta<typeof QuickCapture> = {
  title: 'Tasks/QuickCapture',
  component: QuickCapture,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component for quickly capturing tasks with voice and text input.',
      },
    },
  },
  argTypes: {
    userId: {
      control: 'text',
      description: 'The user ID for the task',
    },
    onTaskCreated: {
      action: 'taskCreated',
      description: 'Callback when a task is created',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    userId: 'user-123',
    onTaskCreated: (task: Task) => console.log('Task created:', task),
  },
};

export default meta;
type Story = StoryObj<typeof QuickCapture>;

export const Default: Story = {
  args: {
    userId: 'user-123',
  },
};

export const WithCustomClass: Story = {
  args: {
    userId: 'user-123',
    className: 'max-w-md',
  },
};

export const Loading: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component in a loading state (simulated by setting isLoading to true).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate loading state by clicking submit
    const input = canvasElement.querySelector('input');
    const submitButton = canvasElement.querySelector('button[type="submit"]');
    
    if (input && submitButton) {
      input.value = 'Test task';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      submitButton.click();
    }
  },
};

export const WithError: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component showing an error state.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Mock an error by modifying the API response
    const { taskApi } = require('@/services/taskApi');
    taskApi.quickCapture.mockRejectedValueOnce(new Error('API Error'));
    
    const input = canvasElement.querySelector('input');
    const submitButton = canvasElement.querySelector('button[type="submit"]');
    
    if (input && submitButton) {
      input.value = 'Test task';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      submitButton.click();
    }
  },
};

export const VoiceInput: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component with voice input capabilities (requires browser support).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Mock speech recognition
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: class MockSpeechRecognition {
        continuous = false;
        interimResults = false;
        lang = 'en-US';
        
        start() {
          setTimeout(() => {
            const event = new Event('result');
            (event as any).results = [[{ transcript: 'Voice captured task' }]];
            this.dispatchEvent(event);
          }, 100);
        }
        
        stop() {}
        abort() {}
        addEventListener() {}
        dispatchEvent() {}
      },
    });
  },
};
