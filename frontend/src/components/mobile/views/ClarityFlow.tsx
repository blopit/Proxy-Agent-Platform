'use client'

import React, { useState } from 'react';
import { MessageCircle, Check } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';

interface ClarityQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'date' | 'number';
  options?: string[];
  placeholder?: string;
}

interface ClarityFlowProps {
  questions: ClarityQuestion[];
  onSubmit: (answers: Record<string, any>) => void;
  onCancel: () => void;
}

const ClarityFlow: React.FC<ClarityFlowProps> = ({ questions, onSubmit, onCancel }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswer = answers[currentQuestion?.id] !== undefined && answers[currentQuestion?.id] !== '';

  const handleAnswer = (answer: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onSubmit(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary, padding: spacing[4] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[2] }}>
          <MessageCircle size={iconSize.lg} style={{ color: semanticColors.accent.secondary }} />
          <h2 style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: semanticColors.text.primary }}>
            Let's clarify
          </h2>
        </div>
        <div
          style={{
            width: '100%',
            height: spacing[1],
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.full,
            overflow: 'hidden'
          }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              background: `linear-gradient(90deg, ${semanticColors.accent.primary}, ${semanticColors.accent.secondary})`
            }}
          />
        </div>
        <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question Bubble */}
      <div className="flex-1 overflow-y-auto" style={{ marginBottom: spacing[4] }}>
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: `${borderRadius.lg} ${borderRadius.lg} ${borderRadius.lg} ${spacing[1]}`,
            padding: spacing[4],
            border: `2px solid ${semanticColors.accent.secondary}`,
            marginBottom: spacing[4],
            position: 'relative'
          }}
        >
          {/* Speech bubble tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: spacing[4],
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: `10px solid ${semanticColors.accent.secondary}`
            }}
          />

          <p style={{ fontSize: fontSize.base, color: semanticColors.text.primary, fontWeight: '500' }}>
            {currentQuestion.question}
          </p>
        </div>

        {/* Answer Input */}
        {currentQuestion.type === 'text' && (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder || 'Type your answer...'}
            className="w-full focus:outline-none"
            style={{
              backgroundColor: semanticColors.bg.secondary,
              color: semanticColors.text.primary,
              padding: spacing[3],
              borderRadius: borderRadius.lg,
              border: `2px solid ${hasAnswer ? semanticColors.accent.primary : semanticColors.border.default}`,
              fontSize: fontSize.base
            }}
            autoFocus
          />
        )}

        {currentQuestion.type === 'choice' && currentQuestion.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="text-left transition-all active:scale-98"
                  style={{
                    backgroundColor: isSelected ? semanticColors.accent.primary : semanticColors.bg.secondary,
                    color: isSelected ? semanticColors.text.inverse : semanticColors.text.primary,
                    padding: spacing[3],
                    borderRadius: borderRadius.lg,
                    border: `2px solid ${isSelected ? semanticColors.accent.primary : semanticColors.border.default}`,
                    fontSize: fontSize.base,
                    fontWeight: isSelected ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span>{option}</span>
                  {isSelected && <Check size={iconSize.sm} />}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'date' && (
          <input
            type="date"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full focus:outline-none"
            style={{
              backgroundColor: semanticColors.bg.secondary,
              color: semanticColors.text.primary,
              padding: spacing[3],
              borderRadius: borderRadius.lg,
              border: `2px solid ${hasAnswer ? semanticColors.accent.primary : semanticColors.border.default}`,
              fontSize: fontSize.base
            }}
            autoFocus
          />
        )}

        {currentQuestion.type === 'number' && (
          <input
            type="number"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder || 'Enter a number...'}
            className="w-full focus:outline-none"
            style={{
              backgroundColor: semanticColors.bg.secondary,
              color: semanticColors.text.primary,
              padding: spacing[3],
              borderRadius: borderRadius.lg,
              border: `2px solid ${hasAnswer ? semanticColors.accent.primary : semanticColors.border.default}`,
              fontSize: fontSize.base
            }}
            autoFocus
          />
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: spacing[2] }}>
        <button
          onClick={currentQuestionIndex === 0 ? onCancel : handleBack}
          className="transition-all active:scale-95"
          style={{
            flex: 1,
            backgroundColor: semanticColors.bg.secondary,
            color: semanticColors.text.primary,
            padding: spacing[3],
            borderRadius: borderRadius.lg,
            border: `2px solid ${semanticColors.border.default}`,
            fontSize: fontSize.base,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {currentQuestionIndex === 0 ? 'Cancel' : '← Back'}
        </button>

        <button
          onClick={handleNext}
          disabled={!hasAnswer}
          className="transition-all active:scale-95"
          style={{
            flex: 2,
            background: hasAnswer
              ? `linear-gradient(135deg, ${semanticColors.accent.primary}, ${semanticColors.accent.secondary})`
              : semanticColors.bg.secondary,
            color: hasAnswer ? semanticColors.text.inverse : semanticColors.text.secondary,
            padding: spacing[3],
            borderRadius: borderRadius.lg,
            border: hasAnswer ? 'none' : `2px solid ${semanticColors.border.default}`,
            fontSize: fontSize.base,
            fontWeight: 'bold',
            cursor: hasAnswer ? 'pointer' : 'not-allowed',
            boxShadow: hasAnswer ? `0 4px 12px ${semanticColors.accent.primary}40` : 'none'
          }}
        >
          {isLastQuestion ? '✓ Complete' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default ClarityFlow;
