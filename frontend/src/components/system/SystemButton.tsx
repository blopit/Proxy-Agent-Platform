'use client'

import React from 'react';
import ChevronButton from '@/components/mobile/core/ChevronButton';

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

// Map SystemButton variants to ChevronButton variants
const variantMapping: Record<ButtonVariant, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  ghost: 'secondary' // Map ghost to secondary for ChevronButton
};

const sizeMapping: Record<ButtonSize, string> = {
  sm: '100px',
  base: '140px',
  lg: '180px'
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
  onClick,
  ...props
}) => {
  return (
    <ChevronButton
      variant={variantMapping[variant]}
      width={fullWidth ? '100%' : sizeMapping[size]}
      onClick={onClick}
      disabled={disabled || isLoading}
      ariaLabel={typeof children === 'string' ? children : 'Button'}
      className={className}
      {...props}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        {isLoading ? (
          <div
            className="animate-spin"
            style={{
              width: size === 'sm' ? '14px' : size === 'base' ? '16px' : '20px',
              height: size === 'sm' ? '14px' : size === 'base' ? '16px' : '20px',
              borderRadius: '50%',
              border: '2px solid currentColor',
              borderTopColor: 'transparent'
            }}
          />
        ) : icon}
        {children}
      </div>
    </ChevronButton>
  );
};

export default SystemButton;
