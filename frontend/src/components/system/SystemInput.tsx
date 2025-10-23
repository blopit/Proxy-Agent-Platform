'use client'

import React, { forwardRef } from 'react';
import { spacing, fontSize, borderRadius, semanticColors, colors } from '@/lib/design-system';

export type InputSize = 'sm' | 'base' | 'lg';
export type InputVariant = 'default' | 'error' | 'success';

interface SystemInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, { padding: string; fontSize: string; height: string }> = {
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
    padding: `${spacing[3]} ${spacing[5]}`,
    fontSize: fontSize.lg,
    height: '48px'
  }
};

const variantStyles: Record<InputVariant, { border: string; focusBorder: string }> = {
  default: {
    border: colors.base01,
    focusBorder: colors.cyan
  },
  error: {
    border: colors.red,
    focusBorder: colors.red
  },
  success: {
    border: colors.green,
    focusBorder: colors.green
  }
};

export const SystemInput = forwardRef<HTMLInputElement, SystemInputProps>(({
  size = 'base',
  variant = 'default',
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[error ? 'error' : variant];
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          className="block mb-1 font-medium"
          style={{
            fontSize: fontSize.sm,
            color: colors.base1
          }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            style={{ color: colors.base01 }}
          >
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full transition-all duration-200 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          style={{
            backgroundColor: disabled ? colors.base02 : colors.base03,
            color: colors.base1,
            border: `2px solid ${isFocused ? variantStyle.focusBorder : variantStyle.border}`,
            borderRadius: borderRadius.lg,
            padding: icon ? `${sizeStyle.padding.split(' ')[0]} ${sizeStyle.padding.split(' ')[1]} ${sizeStyle.padding.split(' ')[0]} 40px` : sizeStyle.padding,
            fontSize: sizeStyle.fontSize,
            height: sizeStyle.height,
            boxShadow: isFocused ? `0 0 0 3px ${variantStyle.focusBorder}20` : 'none'
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          disabled={disabled}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p
          className="mt-1"
          style={{
            fontSize: fontSize.xs,
            color: error ? colors.red : colors.base01
          }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

SystemInput.displayName = 'SystemInput';

export default SystemInput;
