'use client'

import React from 'react';
import { spacing, borderRadius, colors } from '@/lib/design-system';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'base' | 'lg';

interface SystemCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const paddingStyles: Record<CardPadding, string> = {
  none: '0px',
  sm: spacing[3],
  base: spacing[4],
  lg: spacing[6]
};

export const SystemCard: React.FC<SystemCardProps> = ({
  variant = 'default',
  padding = 'base',
  header,
  footer,
  children,
  className = '',
  onClick,
  hoverable = false
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: colors.base02,
      borderRadius: borderRadius.xl,
      transition: 'all 0.2s ease-in-out'
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: isHovered && hoverable
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          border: 'none',
          transform: isHovered && hoverable ? 'translateY(-2px)' : 'none'
        };
      case 'outlined':
        return {
          ...baseStyles,
          border: `2px solid ${colors.base01}`,
          boxShadow: 'none',
          transform: isHovered && hoverable ? 'translateY(-2px)' : 'none'
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none'
        };
      default:
        return {
          ...baseStyles,
          border: `1px solid ${colors.base01}`,
          boxShadow: 'none',
          transform: isHovered && hoverable ? 'translateY(-2px)' : 'none'
        };
    }
  };

  return (
    <div
      className={`${onClick || hoverable ? 'cursor-pointer' : ''} ${className}`}
      style={getCardStyles()}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {header && (
        <div
          style={{
            padding: paddingStyles[padding],
            borderBottom: `1px solid ${colors.base01}`
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding: paddingStyles[padding] }}>
        {children}
      </div>
      {footer && (
        <div
          style={{
            padding: paddingStyles[padding],
            borderTop: `1px solid ${colors.base01}`
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default SystemCard;
