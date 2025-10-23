/**
 * AsyncJobTimeline Examples
 * Demonstrates all three size variants and usage patterns
 */

'use client';

import React, { useState, useEffect } from 'react';
import AsyncJobTimeline, { JobStep } from './AsyncJobTimeline';

// ============================================================================
// Example Data
// ============================================================================

const exampleTask1: JobStep[] = [
  {
    id: 'step1',
    description: 'Check pantry for needed items',
    shortLabel: 'Check pantry',
    detail: 'Look in fridge and cabinets',
    estimatedMinutes: 3,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'done',
  },
  {
    id: 'step2',
    description: 'Make shopping list',
    shortLabel: 'Make list',
    detail: 'Write down all items needed',
    estimatedMinutes: 2,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'active',
  },
  {
    id: 'step3',
    description: 'Check store hours',
    shortLabel: 'Store hours',
    detail: 'AI checking store hours...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🤖',
    status: 'pending',
  },
  {
    id: 'step4',
    description: 'Drive to store',
    shortLabel: 'Drive',
    detail: 'Head to nearest grocery store',
    estimatedMinutes: 10,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'pending',
  },
  {
    id: 'step5',
    description: 'Shop for items',
    shortLabel: 'Shop',
    detail: 'Get all items on your list',
    estimatedMinutes: 20,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'pending',
  },
];

const exampleTask2: JobStep[] = [
  {
    id: 'parse',
    description: 'Parse natural language',
    shortLabel: 'Parse',
    detail: 'Extracting task details...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🧠',
    status: 'done',
  },
  {
    id: 'llm',
    description: 'LLM decomposition',
    shortLabel: 'LLM',
    detail: 'Breaking into micro-steps...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🔨',
    status: 'active',
  },
  {
    id: 'classify',
    description: 'Classify steps',
    shortLabel: 'Classify',
    detail: 'Detecting task types...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🏷️',
    status: 'pending',
  },
  {
    id: 'save',
    description: 'Save to database',
    shortLabel: 'Save',
    detail: 'Creating task record...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '💾',
    status: 'pending',
  },
];

const exampleTask3: JobStep[] = [
  {
    id: 'step1',
    description: 'Find Sara\'s email address',
    shortLabel: 'Find email',
    detail: 'Look up contact info',
    estimatedMinutes: 3,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'done',
  },
  {
    id: 'step2',
    description: 'Draft email message',
    shortLabel: 'Draft',
    detail: 'Write clear, professional email',
    estimatedMinutes: 5,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'done',
  },
  {
    id: 'step3',
    description: 'Attach project files',
    shortLabel: 'Attach',
    detail: 'Locate and attach documents',
    estimatedMinutes: 2,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'active',
  },
  {
    id: 'step4',
    description: 'Review for accuracy',
    shortLabel: 'Review',
    detail: 'Double-check everything',
    estimatedMinutes: 2,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'pending',
  },
  {
    id: 'step5',
    description: 'Send email via agent',
    shortLabel: 'Send',
    detail: 'Agent sending email...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🤖',
    status: 'pending',
  },
];

// ============================================================================
// Example Components
// ============================================================================

export function FullSizeExample() {
  return (
    <div className="space-y-4 p-4 bg-[#002b36] min-h-screen">
      <h2 className="text-[#93a1a1] text-lg font-bold mb-4">Full Size Examples</h2>

      {/* Example 1: Task execution */}
      <div>
        <p className="text-[#586e75] text-xs mb-2">Task execution (mixed human/digital)</p>
        <AsyncJobTimeline
          jobName="Buy groceries tomorrow"
          steps={exampleTask1}
          currentProgress={25}
          size="full"
          onStepClick={(id) => console.log('Clicked step:', id)}
        />
      </div>

      {/* Example 2: Capture progress */}
      <div>
        <p className="text-[#586e75] text-xs mb-2">Capture progress (all digital)</p>
        <AsyncJobTimeline
          jobName="Send email to Sara"
          steps={exampleTask2}
          currentProgress={55}
          size="full"
        />
      </div>

      {/* Example 3: Almost complete */}
      <div>
        <p className="text-[#586e75] text-xs mb-2">Almost complete</p>
        <AsyncJobTimeline
          jobName="Send email to Sara about project"
          steps={exampleTask3}
          currentProgress={75}
          size="full"
          processingTimeMs={847}
        />
      </div>
    </div>
  );
}

export function MicroSizeExample() {
  return (
    <div className="space-y-4 p-4 bg-[#002b36] min-h-screen">
      <h2 className="text-[#93a1a1] text-lg font-bold mb-4">Micro Size Examples</h2>

      {/* Micro - shows icons + short labels */}
      <div>
        <p className="text-[#586e75] text-xs mb-2">Task execution (compact view)</p>
        <AsyncJobTimeline
          jobName="Buy groceries"
          steps={exampleTask1}
          currentProgress={25}
          size="micro"
          onClose={() => console.log('Close clicked')}
        />
      </div>

      <div>
        <p className="text-[#586e75] text-xs mb-2">Capture progress (compact view)</p>
        <AsyncJobTimeline
          jobName="Capturing task..."
          steps={exampleTask2}
          currentProgress={55}
          size="micro"
        />
      </div>
    </div>
  );
}

export function NanoSizeExample() {
  return (
    <div className="space-y-4 p-4 bg-[#002b36] min-h-screen">
      <h2 className="text-[#93a1a1] text-lg font-bold mb-4">Nano Size Examples</h2>

      {/* Nano - just step numbers */}
      <div>
        <p className="text-[#586e75] text-xs mb-2">Minimal progress indicator</p>
        <AsyncJobTimeline
          jobName="Buy groceries"
          steps={exampleTask1}
          currentProgress={25}
          size="nano"
        />
      </div>

      <div>
        <p className="text-[#586e75] text-xs mb-2">Another nano example</p>
        <AsyncJobTimeline
          jobName="Send email"
          steps={exampleTask3}
          currentProgress={75}
          size="nano"
        />
      </div>
    </div>
  );
}

export function AllSizesComparison() {
  return (
    <div className="space-y-6 p-4 bg-[#002b36] min-h-screen">
      <h2 className="text-[#93a1a1] text-lg font-bold mb-4">Size Comparison</h2>

      <div className="space-y-3">
        <div>
          <p className="text-[#586e75] text-xs mb-1">Full Size</p>
          <AsyncJobTimeline
            jobName="Buy groceries tomorrow"
            steps={exampleTask1}
            currentProgress={25}
            size="full"
          />
        </div>

        <div>
          <p className="text-[#586e75] text-xs mb-1">Micro Size</p>
          <AsyncJobTimeline
            jobName="Buy groceries tomorrow"
            steps={exampleTask1}
            currentProgress={25}
            size="micro"
          />
        </div>

        <div>
          <p className="text-[#586e75] text-xs mb-1">Nano Size</p>
          <AsyncJobTimeline
            jobName="Buy groceries tomorrow"
            steps={exampleTask1}
            currentProgress={25}
            size="nano"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Animated Example (Progress Simulation)
// ============================================================================

export function AnimatedExample() {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<JobStep[]>(exampleTask1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Update step statuses based on progress
  useEffect(() => {
    const updated = steps.map((step, index) => {
      const stepStart = (index / steps.length) * 100;
      const stepEnd = ((index + 1) / steps.length) * 100;

      if (progress >= stepEnd) {
        return { ...step, status: 'done' as const };
      } else if (progress >= stepStart && progress < stepEnd) {
        return { ...step, status: 'active' as const };
      }
      return { ...step, status: 'pending' as const };
    });

    setSteps(updated);
  }, [progress]);

  return (
    <div className="p-4 bg-[#002b36] min-h-screen">
      <h2 className="text-[#93a1a1] text-lg font-bold mb-4">Animated Example</h2>

      <div className="space-y-4">
        <AsyncJobTimeline
          jobName="Buy groceries tomorrow"
          steps={steps}
          currentProgress={progress}
          size="full"
          processingTimeMs={progress >= 100 ? 5000 : undefined}
        />

        <button
          onClick={() => {
            setProgress(0);
            setSteps(exampleTask1);
          }}
          className="px-4 py-2 bg-[#268bd2] text-[#002b36] rounded hover:bg-[#2aa198] transition-colors"
        >
          Restart Animation
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Usage in Capture Flow
// ============================================================================

export function CaptureFlowExample() {
  const [captureSteps] = useState<JobStep[]>(exampleTask2);
  const [captureProgress, setCaptureProgress] = useState(0);

  useEffect(() => {
    // Simulate capture progress
    const interval = setInterval(() => {
      setCaptureProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-[#002b36] min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-[#93a1a1] text-lg font-bold">Capture Tab Integration</h2>

        {/* Progress bar above textarea */}
        {captureProgress > 0 && captureProgress < 100 && (
          <AsyncJobTimeline
            jobName="Send email to Sara about project"
            steps={captureSteps}
            currentProgress={captureProgress}
            size="full"
          />
        )}

        {/* Textarea */}
        <textarea
          className="w-full h-32 p-3 bg-[#073642] border border-[#586e75] rounded text-[#93a1a1] resize-none"
          placeholder="What needs to get done?"
          disabled={captureProgress > 0 && captureProgress < 100}
        />

        {/* Success state */}
        {captureProgress >= 100 && (
          <div className="p-4 bg-[#859900]/20 border border-[#859900] rounded">
            <p className="text-[#859900] text-sm text-center">
              ✅ Task captured successfully in 847ms!
            </p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 px-4 py-2 bg-[#2aa198] text-[#002b36] font-medium rounded">
                View Task
              </button>
              <button className="flex-1 px-4 py-2 bg-[#268bd2] text-[#002b36] font-medium rounded">
                Start
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
