'use client'

import React, { useEffect } from 'react';
import { spacing, fontSize, borderRadius, colors } from '@/lib/design-system';
import { X } from 'lucide-react';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: '400px',
  base: '600px',
  lg: '800px',
  xl: '1000px',
  full: '95vw'
};

export const SystemModal: React.FC<SystemModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'base',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        backgroundColor: 'rgba(0, 43, 54, 0.9)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`
          relative w-full transition-all duration-300 ease-in-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{
          maxWidth: sizeStyles[size],
          backgroundColor: colors.base02,
          borderRadius: borderRadius['2xl'],
          border: `2px solid ${colors.base01}`,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{
              padding: spacing[6],
              borderBottom: `1px solid ${colors.base01}`
            }}
          >
            {title && (
              <h2
                className="font-semibold"
                style={{
                  fontSize: fontSize['2xl'],
                  color: colors.base1
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="transition-colors duration-200 hover:opacity-70 ml-auto"
                style={{
                  color: colors.base01,
                  padding: spacing[1]
                }}
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: spacing[6],
            color: colors.base1
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex-shrink-0"
            style={{
              padding: spacing[6],
              borderTop: `1px solid ${colors.base01}`,
              backgroundColor: colors.base03
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemModal;
