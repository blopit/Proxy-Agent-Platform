/**
 * Tests for Capture Service - submitClarifications
 * Following TDD approach
 */

import { submitClarifications } from '../captureService';
import type { MicroStep, ClarifyResponse } from '../../types/capture';

describe('submitClarifications', () => {
  const mockMicroSteps: MicroStep[] = [
    {
      step_id: 'step_1',
      description: 'Set up project',
      estimated_minutes: 30,
      delegation_mode: 'human',
      leaf_type: 'atomic',
    },
  ];

  const mockAnswers = {
    platform: 'iOS and Android',
    timeline: '3 months',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    (global.fetch as jest.Mock).mockClear();
  });

  it('should call /api/v1/capture/clarify with correct payload', async () => {
    const mockResponse: ClarifyResponse = {
      task: {},
      micro_steps: mockMicroSteps,
      clarifications: [],
      ready_to_save: true,
      mode: 'auto',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await submitClarifications(mockMicroSteps, mockAnswers);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/capture/clarify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          micro_steps: mockMicroSteps,
          answers: mockAnswers,
        }),
      }
    );
  });

  it('should return ClarifyResponse on success', async () => {
    const mockResponse: ClarifyResponse = {
      task: { task_id: 'task_1', title: 'Test Task' },
      micro_steps: [
        ...mockMicroSteps,
        {
          step_id: 'step_2',
          description: 'New refined step',
          estimated_minutes: 15,
          delegation_mode: 'human',
          leaf_type: 'atomic',
        },
      ],
      clarifications: [],
      ready_to_save: true,
      mode: 'auto',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await submitClarifications(mockMicroSteps, mockAnswers);

    expect(result).toEqual(mockResponse);
    expect(result.micro_steps).toHaveLength(2);
    expect(result.clarifications).toHaveLength(0);
    expect(result.ready_to_save).toBe(true);
  });

  it('should return more clarifications if needed', async () => {
    const mockResponse: ClarifyResponse = {
      task: {},
      micro_steps: mockMicroSteps,
      clarifications: [
        {
          field: 'team_size',
          question: 'How many developers?',
          required: true,
        },
      ],
      ready_to_save: false,
      mode: 'auto',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await submitClarifications(mockMicroSteps, mockAnswers);

    expect(result.clarifications).toHaveLength(1);
    expect(result.ready_to_save).toBe(false);
  });

  it('should throw error on API failure', async () => {
    const errorDetail = 'Invalid micro-steps format';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: errorDetail }),
    });

    await expect(
      submitClarifications(mockMicroSteps, mockAnswers)
    ).rejects.toThrow(errorDetail);
  });

  it('should throw generic error when no detail provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(
      submitClarifications(mockMicroSteps, mockAnswers)
    ).rejects.toThrow('Clarify failed');
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(
      submitClarifications(mockMicroSteps, mockAnswers)
    ).rejects.toThrow('Network error');
  });

  it('should handle non-Error exceptions', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

    await expect(
      submitClarifications(mockMicroSteps, mockAnswers)
    ).rejects.toThrow('Clarify failed');
  });
});
