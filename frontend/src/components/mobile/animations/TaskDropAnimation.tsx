/**
 * TaskDropAnimation - Satisfying "task dropping into inbox" animation
 *
 * Visual feedback when user submits a task:
 * - Text morphs into a card
 * - Smooth fade + slide down effect
 * - 500ms duration for quick dopamine hit
 */

'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { spacing, fontSize, borderRadius, semanticColors } from '@/lib/design-system';

interface TaskDropAnimationProps {
  text: string;
}

export default function TaskDropAnimation({ text }: TaskDropAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        y: 100,
        scale: 0.8,
      }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
      }}
      style={{
        position: 'fixed',
        left: '50%',
        top: '40%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        width: '90%',
        maxWidth: '500px',
      }}
    >
      <div
        style={{
          padding: spacing[4],
          backgroundColor: semanticColors.bg.secondary,
          borderRadius: borderRadius.base,
          border: `2px solid ${semanticColors.accent.primary}`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            fontSize: fontSize.base,
            color: semanticColors.text.primary,
            lineHeight: '1.5',
          }}
        >
          {text}
        </div>
      </div>
    </motion.div>
  );
}
