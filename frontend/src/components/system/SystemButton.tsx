'use client'

import React from 'react';
import { spacing, fontSize, borderRadius, semanticColors, colors } from '@/lib/design-system';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
export type ButtonSize = 'sm' | 'base' | 'lg';

interface SystemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string; hoverBg: string }> = {
  primary: {
    bg: colors.cyan,
    text: colors.base03,
    border: colors.cyan,
    hoverBg: '#35b5ac' // Slightly lighter cyan
  },
  secondary: {
    bg: colors.blue,
    text: colors.base3,
    border: colors.blue,
    hoverBg: '#3a9ee5' // Slightly lighter blue
  },
  success: {
    bg: colors.green,
    text: colors.base03,
    border: colors.green,
    hoverBg: '#96aa00' // Slightly lighter green
  },
  warning: {
    bg: colors.yellow,
    text: colors.base03,
    border: colors.yellow,
    hoverBg: '#cb9b00' // Slightly lighter yellow
  },
  error: {
    bg: colors.red,
    text: colors.base3,
    border: colors.red,
    hoverBg: '#e64747' // Slightly lighter red
  },
  ghost: {
    bg: 'transparent',
    text: colors.base1,
    border: colors.base01,
    hoverBg: colors.base02
  }
};

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: string; height: string }> = {
  sm: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: fontSize.sm,
    height: '32px'
  },
  base: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: fontSize.base,
    height: '40px'
  },
  lg: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: fontSize.lg,
    height: '48px'
  }
};

export const SystemButton: React.FC<SystemButtonProps> = ({
  variant = 'primary',
  size = 'base',
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        relative inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200 ease-in-out
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        backgroundColor: isDisabled ? colors.base02 : variantStyle.bg,
        color: isDisabled ? colors.base01 : variantStyle.text,
        border: `2px solid ${isDisabled ? colors.base01 : variantStyle.border}`,
        borderRadius: borderRadius.lg,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        height: sizeStyle.height,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: !isDisabled && variant !== 'ghost'
          ? `0 2px 8px ${variantStyle.bg}40`
          : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = variantStyle.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = variantStyle.bg;
        }
      }}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <div
          className="animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{
            width: size === 'sm' ? '14px' : size === 'base' ? '16px' : '20px',
            height: size === 'sm' ? '14px' : size === 'base' ? '16px' : '20px'
          }}
        />
      ) : icon}
      {children}
    </button>
  );
};

export default SystemButton;
