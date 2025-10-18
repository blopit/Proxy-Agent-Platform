import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuickCapture } from '../QuickCapture'
import { taskApi } from '@/services/taskApi'
import { TaskPriority } from '@/types/task'

// Mock the task API
jest.mock('@/services/taskApi', () => ({
  taskApi: {
    quickCapture: jest.fn(),
    processVoiceInput: jest.fn(),
  },
}))

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
}
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
}

Object.defineProperty(global.window, 'SpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
})

Object.defineProperty(global.window, 'webkitSpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
})

const mockOnTaskCreated = jest.fn()

const defaultProps = {
  userId: 'user123',
  onTaskCreated: mockOnTaskCreated,
}

describe('QuickCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      })
    })
  })

  describe('Text Input', () => {
    it('renders input field and submit button', () => {
      render(<QuickCapture {...defaultProps} />)

      expect(screen.getByPlaceholderText(/quick capture/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument()
    })

    it('allows typing in the input field', () => {
      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })

      expect(input).toHaveValue('Buy groceries')
    })

    it('submits task when form is submitted', async () => {
      const mockTask = {
        task_id: 'task-123',
        title: 'Buy groceries',
        description: 'Quick captured task',
        project_id: 'default-project',
        status: 'todo',
        priority: TaskPriority.MEDIUM,
        tags: [],
        progress_percentage: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        dependencies: [],
        labels: [],
        external_references: {},
        subtask_count: 0,
      }

      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: mockTask,
        processing_time_ms: 1500,
      })

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      const submitButton = screen.getByRole('button', { name: /capture/i })

      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(taskApi.quickCapture).toHaveBeenCalledWith({
          text: 'Buy groceries',
          user_id: 'user123',
          location: {
            lat: 37.7749,
            lng: -122.4194,
          },
          voice_input: false,
        })
      })

      expect(mockOnTaskCreated).toHaveBeenCalledWith(mockTask)
    })

    it('clears input after successful submission', async () => {
      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: { task_id: 'task-123' },
        processing_time_ms: 1500,
      })

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(screen.getByRole('button', { name: /capture/i }))

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('shows loading state during submission', async () => {
      ;(taskApi.quickCapture as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      const submitButton = screen.getByRole('button', { name: /capture/i })

      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/capturing/i)).toBeInTheDocument()
    })

    it('handles API errors gracefully', async () => {
      ;(taskApi.quickCapture as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(screen.getByRole('button', { name: /capture/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to capture task/i)).toBeInTheDocument()
      })
    })
  })

  describe('Voice Input', () => {
    it('shows voice button when speech recognition is supported', () => {
      render(<QuickCapture {...defaultProps} />)
      expect(screen.getByRole('button', { name: /voice/i })).toBeInTheDocument()
    })

    it('starts voice recording when voice button is clicked', () => {
      render(<QuickCapture {...defaultProps} />)

      const voiceButton = screen.getByRole('button', { name: /voice/i })
      fireEvent.click(voiceButton)

      expect(mockSpeechRecognition.start).toHaveBeenCalled()
    })

    it('shows recording state when voice is active', () => {
      render(<QuickCapture {...defaultProps} />)

      const voiceButton = screen.getByRole('button', { name: /voice/i })
      fireEvent.click(voiceButton)

      expect(screen.getByText(/listening/i)).toBeInTheDocument()
    })

    it('processes voice input and submits task', async () => {
      const mockTask = {
        task_id: 'task-voice-123',
        title: 'Call dentist',
        description: 'Processed from voice input',
        project_id: 'default-project',
        status: 'todo',
        priority: TaskPriority.MEDIUM,
        tags: [],
        progress_percentage: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        dependencies: [],
        labels: [],
        external_references: {},
        subtask_count: 0,
      }

      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: mockTask,
        processing_time_ms: 1800,
      })

      render(<QuickCapture {...defaultProps} />)

      const voiceButton = screen.getByRole('button', { name: /voice/i })
      fireEvent.click(voiceButton)

      // Simulate speech recognition result
      const onResultCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'result')[1]

      if (onResultCallback) {
        onResultCallback({
          results: [{
            0: { transcript: 'call dentist tomorrow' },
            isFinal: true,
          }],
        })
      }

      await waitFor(() => {
        expect(taskApi.quickCapture).toHaveBeenCalledWith({
          text: 'call dentist tomorrow',
          user_id: 'user123',
          location: {
            lat: 37.7749,
            lng: -122.4194,
          },
          voice_input: true,
        })
      })

      expect(mockOnTaskCreated).toHaveBeenCalledWith(mockTask)
    })
  })

  describe('Location Integration', () => {
    it('includes location data when available', async () => {
      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: { task_id: 'task-123' },
        processing_time_ms: 1500,
      })

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(screen.getByRole('button', { name: /capture/i }))

      await waitFor(() => {
        expect(taskApi.quickCapture).toHaveBeenCalledWith({
          text: 'Buy groceries',
          user_id: 'user123',
          location: {
            lat: 37.7749,
            lng: -122.4194,
          },
          voice_input: false,
        })
      })
    })

    it('works without location when geolocation fails', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'Permission denied' })
      })

      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: { task_id: 'task-123' },
        processing_time_ms: 1500,
      })

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(screen.getByRole('button', { name: /capture/i }))

      await waitFor(() => {
        expect(taskApi.quickCapture).toHaveBeenCalledWith({
          text: 'Buy groceries',
          user_id: 'user123',
          voice_input: false,
        })
      })
    })
  })

  describe('Performance', () => {
    it('shows processing time feedback for fast captures', async () => {
      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: { task_id: 'task-123' },
        processing_time_ms: 800,
      })

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(screen.getByRole('button', { name: /capture/i }))

      await waitFor(() => {
        expect(screen.getByText(/captured in 0.8s/i)).toBeInTheDocument()
      })
    })

    it('warns about slow processing', async () => {
      ;(taskApi.quickCapture as jest.Mock).mockResolvedValue({
        task: { task_id: 'task-123' },
        processing_time_ms: 3000,
      })

      render(<QuickCapture {...defaultProps} />)

      const input = screen.getByPlaceholderText(/quick capture/i)
      fireEvent.change(input, { target: { value: 'Buy groceries' } })
      fireEvent.click(screen.getByRole('button', { name: /capture/i }))

      await waitFor(() => {
        expect(screen.getByText(/took 3.0s/i)).toBeInTheDocument()
      })
    })
  })
})