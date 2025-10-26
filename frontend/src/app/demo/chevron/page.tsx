'use client'

import React, { useState, useEffect } from 'react'
import ChevronProgress, { ChevronProgressVertical, ChevronStep } from '@/components/mobile/ChevronProgress'
import { spacing, semanticColors, fontSize } from '@/lib/design-system'

export default function ChevronDemo() {
  const [captureProgress, setCaptureProgress] = useState(0)
  const [autoProgress, setAutoProgress] = useState(false)

  // Example 1: Task Capture Flow
  const [captureSteps, setCaptureSteps] = useState<ChevronStep[]>([
    { id: 'parse', label: 'Parse Input', status: 'pending', icon: '🧠' },
    { id: 'llm', label: 'AI Breakdown', status: 'pending', icon: '🔨' },
    { id: 'save', label: 'Save to DB', status: 'pending', icon: '💾' }
  ])

  // Example 2: Mode Journey
  const modeSteps: ChevronStep[] = [
    { id: 'capture', label: 'Capture', status: 'done', icon: '✨', detail: 'Complete' },
    { id: 'scout', label: 'Scout', status: 'done', icon: '🔍', detail: 'Complete' },
    { id: 'hunt', label: 'Hunt', status: 'active', icon: '🎯', detail: 'In progress' },
    { id: 'mend', label: 'Mend', status: 'pending', icon: '💙', detail: 'Next' },
    { id: 'map', label: 'Map', status: 'pending', icon: '🗺️', detail: 'Later' }
  ]

  // Example 3: Onboarding
  const onboardingSteps: ChevronStep[] = [
    { id: 'account', label: 'Create Account', status: 'done', icon: '👤', detail: 'Welcome!' },
    { id: 'prefs', label: 'Set Preferences', status: 'active', icon: '⚙️', detail: 'Almost there' },
    { id: 'first', label: 'First Task', status: 'pending', icon: '🎯', detail: 'Final step' }
  ]

  // Auto-progress simulation
  useEffect(() => {
    if (!autoProgress) return

    const interval = setInterval(() => {
      setCaptureSteps(prev => {
        const activeIndex = prev.findIndex(s => s.status === 'active')
        const pendingIndex = prev.findIndex(s => s.status === 'pending')

        if (pendingIndex === -1) {
          setAutoProgress(false)
          return prev
        }

        return prev.map((step, i) => {
          if (i < pendingIndex) return { ...step, status: 'done' as const }
          if (i === pendingIndex) return { ...step, status: 'active' as const }
          return step
        })
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [autoProgress])

  const resetCapture = () => {
    setCaptureSteps([
      { id: 'parse', label: 'Parse Input', status: 'pending', icon: '🧠' },
      { id: 'llm', label: 'AI Breakdown', status: 'pending', icon: '🔨' },
      { id: 'save', label: 'Save to DB', status: 'pending', icon: '💾' }
    ])
    setAutoProgress(false)
  }

  const startAutoProgress = () => {
    resetCapture()
    setTimeout(() => {
      setCaptureSteps(prev => prev.map((s, i) =>
        i === 0 ? { ...s, status: 'active' as const } : s
      ))
      setAutoProgress(true)
    }, 100)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: semanticColors.bg.primary,
      padding: spacing[6]
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: spacing[8] }}>
          <h1 style={{
            fontSize: fontSize['3xl'],
            fontWeight: '700',
            color: semanticColors.text.primary,
            marginBottom: spacing[2]
          }}>
            Chevron Progress Components
          </h1>
          <p style={{
            fontSize: fontSize.base,
            color: semanticColors.text.secondary
          }}>
            Beautiful, accessible progress indicators for ADHD-friendly workflows
          </p>
        </div>

        {/* Example 1: Interactive Task Capture */}
        <Section title="1. Task Capture Flow" description="Simulates real-time task processing">
          <ChevronProgress
            steps={captureSteps}
            variant="default"
            showProgress={true}
          />

          <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[4] }}>
            <Button onClick={startAutoProgress} disabled={autoProgress}>
              ▶️ Start Auto Progress
            </Button>
            <Button onClick={resetCapture} disabled={autoProgress}>
              🔄 Reset
            </Button>
            <Button
              onClick={() => setCaptureSteps(prev => prev.map(s => ({
                ...s,
                status: 'done' as const
              })))}
              disabled={autoProgress}
            >
              ✓ Complete All
            </Button>
          </div>
        </Section>

        {/* Example 2: Mode Journey */}
        <Section title="2. Biological Circuit Journey" description="User's progress through modes">
          <ChevronProgress
            steps={modeSteps}
            variant="default"
            showProgress={true}
          />
        </Section>

        {/* Example 3: Onboarding */}
        <Section title="3. Onboarding Flow" description="New user setup process">
          <ChevronProgress
            steps={onboardingSteps}
            variant="default"
            showProgress={false}
          />
        </Section>

        {/* Example 4: Compact Variant */}
        <Section title="4. Compact Variant" description="Smaller size for tight spaces">
          <ChevronProgress
            steps={[
              { id: '1', label: 'Parse', status: 'done', icon: '🧠' },
              { id: '2', label: 'Process', status: 'active', icon: '⚡' },
              { id: '3', label: 'Save', status: 'pending', icon: '💾' }
            ]}
            variant="compact"
            showProgress={true}
          />
        </Section>

        {/* Example 5: Many Steps */}
        <Section title="5. Many Steps" description="Handles 7+ steps gracefully">
          <ChevronProgress
            steps={[
              { id: '1', label: 'Step 1', status: 'done', icon: '1️⃣' },
              { id: '2', label: 'Step 2', status: 'done', icon: '2️⃣' },
              { id: '3', label: 'Step 3', status: 'done', icon: '3️⃣' },
              { id: '4', label: 'Step 4', status: 'active', icon: '4️⃣' },
              { id: '5', label: 'Step 5', status: 'pending', icon: '5️⃣' },
              { id: '6', label: 'Step 6', status: 'pending', icon: '6️⃣' },
              { id: '7', label: 'Step 7', status: 'pending', icon: '7️⃣' }
            ]}
            variant="compact"
          />
        </Section>

        {/* Example 6: Vertical Variant (Mobile) */}
        <Section title="6. Vertical Variant" description="Mobile-friendly stacked layout">
          <div style={{ maxWidth: '400px' }}>
            <ChevronProgressVertical
              steps={[
                {
                  id: '1',
                  label: 'Account Created',
                  status: 'done',
                  icon: '✓',
                  detail: 'Completed 5 min ago'
                },
                {
                  id: '2',
                  label: 'Email Verified',
                  status: 'active',
                  icon: '⚡',
                  detail: 'Check your inbox'
                },
                {
                  id: '3',
                  label: 'Profile Setup',
                  status: 'pending',
                  icon: '○',
                  detail: 'Up next'
                }
              ]}
            />
          </div>
        </Section>

        {/* Example 7: No Icons */}
        <Section title="7. Without Icons" description="Clean text-only version">
          <ChevronProgress
            steps={[
              { id: '1', label: 'Initialize', status: 'done' },
              { id: '2', label: 'Processing', status: 'active' },
              { id: '3', label: 'Finalize', status: 'pending' }
            ]}
            variant="compact"
          />
        </Section>

        {/* Example 8: Two Steps */}
        <Section title="8. Minimal (2 Steps)" description="Works with just 2 steps">
          <ChevronProgress
            steps={[
              { id: '1', label: 'Before', status: 'done', icon: '📥' },
              { id: '2', label: 'After', status: 'active', icon: '📤' }
            ]}
            variant="default"
          />
        </Section>

        {/* Visual Specs */}
        <Section title="Visual Specifications" description="Design system integration">
          <div style={{
            padding: spacing[4],
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: fontSize.sm,
            color: semanticColors.text.primary
          }}>
            <div style={{ marginBottom: spacing[2] }}>
              <strong>Colors:</strong>
            </div>
            <div style={{ paddingLeft: spacing[4] }}>
              <div>• Done: #859900 (Solarized Green)</div>
              <div>• Active: #268bd2 (Solarized Blue)</div>
              <div>• Pending: bg.secondary (Theme-aware)</div>
            </div>

            <div style={{ marginTop: spacing[3], marginBottom: spacing[2] }}>
              <strong>Sizes:</strong>
            </div>
            <div style={{ paddingLeft: spacing[4] }}>
              <div>• Default: 72px height, 26px chevron</div>
              <div>• Compact: 64px height, 22px chevron</div>
              <div>• Gap: 10px between steps</div>
            </div>

            <div style={{ marginTop: spacing[3], marginBottom: spacing[2] }}>
              <strong>Animations:</strong>
            </div>
            <div style={{ paddingLeft: spacing[4] }}>
              <div>• Pulse: 2s infinite on active</div>
              <div>• Transition: 0.4s cubic-bezier</div>
              <div>• Progress: 0.6s cubic-bezier</div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: spacing[8],
          padding: spacing[4],
          textAlign: 'center',
          color: semanticColors.text.secondary,
          fontSize: fontSize.sm
        }}>
          <p>Component: ChevronProgress.tsx</p>
          <p>Documentation: docs/CHEVRON_PROGRESS_GUIDE.md</p>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      marginBottom: spacing[8],
      padding: spacing[6],
      backgroundColor: semanticColors.bg.secondary,
      borderRadius: '16px',
      border: `1px solid ${semanticColors.border.default}`
    }}>
      <div style={{ marginBottom: spacing[4] }}>
        <h2 style={{
          fontSize: fontSize.xl,
          fontWeight: '700',
          color: semanticColors.text.primary,
          marginBottom: spacing[1]
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: fontSize.sm,
          color: semanticColors.text.secondary
        }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

function Button({
  onClick,
  disabled,
  children
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: `${spacing[2]} ${spacing[4]}`,
        backgroundColor: disabled ? semanticColors.bg.tertiary : semanticColors.accent.primary,
        color: disabled ? semanticColors.text.secondary : '#fdf6e3',
        border: 'none',
        borderRadius: '8px',
        fontSize: fontSize.sm,
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </button>
  )
}
