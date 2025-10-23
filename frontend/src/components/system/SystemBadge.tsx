'use client'

import React from 'react';
import { spacing, fontSize, borderRadius, colors } from '@/lib/design-system';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'base' | 'lg';

interface SystemBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: `${colors.cyan}20`,
    text: colors.cyan,
    border: colors.cyan
  },
  secondary: {
    bg: `${colors.blue}20`,
    text: colors.blue,
    border: colors.blue
  },
  success: {
    bg: `${colors.green}20`,
    text: colors.green,
    border: colors.green
  },
  warning: {
    bg: `${colors.yellow}20`,
    text: colors.yellow,
    border: colors.yellow
  },
  error: {
    bg: `${colors.red}20`,
    text: colors.red,
    border: colors.red
  },
  info: {
    bg: `${colors.base1}20`,
    text: colors.base1,
    border: colors.base01
  }
};

const sizeStyles: Record<BadgeSize, { padding: string; fontSize: string; height: string }> = {
  sm: {
    padding: `2px ${spacing[2]}`,
    fontSize: fontSize.xs,
    height: '20px'
  },
  base: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: fontSize.sm,
    height: '24px'
  },
  lg: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: fontSize.base,
    height: '32px'
  }
};

export const SystemBadge: React.FC<SystemBadgeProps> = ({
  variant = 'primary',
  size = 'base',
  children,
  icon,
  dot = false,
  className = ''
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${className}`}
      style={{
        backgroundColor: variantStyle.bg,
        color: variantStyle.text,
        border: `1px solid ${variantStyle.border}`,
        borderRadius: borderRadius.full,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        height: sizeStyle.height,
        lineHeight: '1'
      }}
    >
      {dot && (
        <span
          className="rounded-full animate-pulse"
          style={{
            width: size === 'sm' ? '6px' : size === 'base' ? '8px' : '10px',
            height: size === 'sm' ? '6px' : size === 'base' ? '8px' : '10px',
            backgroundColor: variantStyle.text
          }}
        />
      )}
      {icon}
      {children}
    </span>
  );
};

export default SystemBadge;
