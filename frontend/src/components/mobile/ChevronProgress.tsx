'use client'

import React from 'react'
import './ChevronProgress.css'

export interface ChevronStep {
  id: string
  label: string
  status: 'done' | 'active' | 'pending'
  icon?: string
  detail?: string
}

interface ChevronProgressProps {
  steps: ChevronStep[]
  variant?: 'default' | 'compact'
  showProgress?: boolean
  className?: string
}

export default function ChevronProgress({
  steps,
  variant = 'default',
  showProgress = true,
  className = ''
}: ChevronProgressProps) {
  // Calculate overall progress percentage
  const completedSteps = steps.filter(s => s.status === 'done').length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className={`chevron-wrapper ${className}`}>
      {/* Chevron bar */}
      <div
        className={`chevron-route ${variant === 'compact' ? 'chevron-route--compact' : ''}`}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`chevron-step chevron-step--${step.status}`}
            role="listitem"
            aria-current={step.status === 'active' ? 'step' : undefined}
          >
            <div className="chevron-step__body">
              {step.icon && <span className="chevron-step__icon">{step.icon}</span>}
              <div className="chevron-step__content">
                <div className="chevron-step__label">{step.label}</div>
                {variant === 'default' && step.detail && (
                  <div className="chevron-step__detail">{step.detail}</div>
                )}
              </div>
            </div>

            {/* Screen reader only status */}
            <span className="sr-only">
              {step.status === 'done' && 'Completed'}
              {step.status === 'active' && 'Current step'}
              {step.status === 'pending' && 'Pending'}
            </span>
          </div>
        ))}
      </div>

      {/* Optional progress bar underneath */}
      {showProgress && (
        <div className="chevron-progress-bar">
          <div
            className="chevron-progress-bar__fill"
            style={{ width: `${progress}%` }}
            role="presentation"
          />
        </div>
      )}
    </div>
  )
}

// Vertical variant for mobile
export function ChevronProgressVertical({
  steps,
  className = ''
}: {
  steps: ChevronStep[]
  className?: string
}) {
  const completedSteps = steps.filter(s => s.status === 'done').length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className={`chevron-vertical ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id}>
          <div
            className={`chevron-vertical__step chevron-vertical__step--${step.status}`}
            role="listitem"
            aria-current={step.status === 'active' ? 'step' : undefined}
          >
            {step.icon && <span className="chevron-vertical__icon">{step.icon}</span>}
            <div className="chevron-vertical__content">
              <div className="chevron-vertical__label">{step.label}</div>
              {step.detail && (
                <div className="chevron-vertical__detail">{step.detail}</div>
              )}
            </div>
            {step.status === 'done' && <span className="chevron-vertical__check">✓</span>}
            {step.status === 'active' && <span className="chevron-vertical__pulse" />}
          </div>

          {/* Connection line between steps */}
          {index < steps.length - 1 && (
            <div className="chevron-vertical__connector" />
          )}
        </div>
      ))}

      {/* Progress summary */}
      <div className="chevron-vertical__summary">
        {completedSteps} of {steps.length} completed ({Math.round(progress)}%)
      </div>
    </div>
  )
}
