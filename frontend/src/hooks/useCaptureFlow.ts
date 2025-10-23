/**
 * useCaptureFlow - Custom hook for task capture flow with ADHD-friendly UX
 *
 * Handles:
 * - Task submission with progressive loading states
 * - Error handling with toast notifications
 * - Success celebrations
 * - State management for breakdown display
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import type {
  CaptureResponse,
  QuickCaptureRequest,
  LoadingStage,
  CaptureFlowState
} from '@/types/capture';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UseCaptureFlowOptions {
  onSuccess?: (response: CaptureResponse) => void;
  onError?: (error: Error) => void;
}

export function useCaptureFlow(options: UseCaptureFlowOptions = {}) {
  const [state, setState] = useState<CaptureFlowState>({
    isProcessing: false,
    loadingStage: null,
    capturedTask: null,
    error: null,
    showBreakdown: false,
    showDropAnimation: false,
  });

  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingStartTime = useRef<number>(0);

  // Progressive loading stages
  useEffect(() => {
    if (state.isProcessing && state.loadingStage === 'analyzing') {
      // After 2 seconds, move to breaking_down
      const timer1 = setTimeout(() => {
        setState(prev => ({ ...prev, loadingStage: 'breaking_down' }));
      }, 2000);

      // After 4 seconds, move to almost_done
      const timer2 = setTimeout(() => {
        setState(prev => ({ ...prev, loadingStage: 'almost_done' }));
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [state.isProcessing, state.loadingStage]);

  const capture = useCallback(async (request: QuickCaptureRequest) => {
    // Validation
    if (!request.text?.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    processingStartTime.current = Date.now();

    // Show drop animation
    setState(prev => ({
      ...prev,
      showDropAnimation: true,
      error: null,
    }));

    // After drop animation (500ms), start processing
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        loadingStage: 'analyzing',
        showDropAnimation: false,
      }));
    }, 500);

    try {
      const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: CaptureResponse = await response.json();

      // Check for API-level errors
      if (data.error) {
        throw new Error(data.error);
      }

      const processingTime = Date.now() - processingStartTime.current;
      console.log(`Task captured in ${processingTime}ms`);

      // Success!
      setState(prev => ({
        ...prev,
        isProcessing: false,
        loadingStage: null,
        capturedTask: data,
        showBreakdown: true,
        error: null,
      }));

      // Success toast
      toast.success('Task captured successfully!', {
        duration: 2000,
        icon: '✅',
      });

      options.onSuccess?.(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Capture error:', error);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        loadingStage: null,
        error: errorMessage,
      }));

      // Error toast
      toast.error(`Capture failed: ${errorMessage}`, {
        duration: 5000,
      });

      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [options]);

  const retry = useCallback((request: QuickCaptureRequest) => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
    capture(request);
  }, [capture]);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      loadingStage: null,
      capturedTask: null,
      error: null,
      showBreakdown: false,
      showDropAnimation: false,
    });
  }, []);

  const closeBreakdown = useCallback(() => {
    setState(prev => ({
      ...prev,
      showBreakdown: false,
    }));
  }, []);

  return {
    ...state,
    capture,
    retry,
    reset,
    closeBreakdown,
  };
}
