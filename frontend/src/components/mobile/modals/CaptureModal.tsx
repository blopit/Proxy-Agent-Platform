'use client'

import React, { useState, useRef, useEffect } from 'react';
import { XCircle, Link, Zap, Edit } from 'lucide-react';
import { siGmail, siGooglecalendar, siGoogledrive, siSlack } from 'simple-icons';
import ChevronStep from '../core/ChevronStep';
import ConnectionElement, { ConnectionStatus } from '../connections/ConnectionElement';
import { semanticColors, spacing, fontSize, borderRadius } from '@/lib/design-system';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * CaptureModal - Full-screen swipeable modal for Add/Capture functionality
 *
 * Features:
 * - Full viewport coverage
 * - X button (top left) to dismiss
 * - Swipeable pages: Connections, Suggestions, Manual
 * - Bottom tabs navigation (clickable + swipeable)
 * - Design system compliant (no theme context)
 * - Page transition animations with reduced motion support
 */

export interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number; // 0=Connections, 1=Suggestions, 2=Manual
}

interface Connection {
  id: string;
  provider: string;
  iconSvg: string;
  iconColor: string;
  status: ConnectionStatus;
}

const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  onClose,
  initialPage = 0
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'gmail', provider: 'Gmail', iconSvg: siGmail.path, iconColor: `#${siGmail.hex}`, status: 'disconnected' },
    { id: 'calendar', provider: 'Google Calendar', iconSvg: siGooglecalendar.path, iconColor: `#${siGooglecalendar.hex}`, status: 'disconnected' },
    { id: 'drive', provider: 'Google Drive', iconSvg: siGoogledrive.path, iconColor: `#${siGoogledrive.hex}`, status: 'connected' },
    { id: 'slack', provider: 'Slack', iconSvg: siSlack.path, iconColor: `#${siSlack.hex}`, status: 'disconnected' },
  ]);

  // Swipe detection
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const threshold = 50; // 50px minimum swipe distance

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && currentPage < 2) {
        // Swipe left → next page
        setCurrentPage(currentPage + 1);
      } else if (swipeDistance < 0 && currentPage > 0) {
        // Swipe right → previous page
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleConnectionChange = (id: string, newStatus: ConnectionStatus) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.id === id ? { ...conn, status: newStatus } : conn
      )
    );
  };

  const handleConnect = (id: string) => {
    handleConnectionChange(id, 'connecting');

    setTimeout(() => {
      const success = Math.random() > 0.2;
      handleConnectionChange(id, success ? 'connected' : 'error');
    }, 2000);
  };

  // Page tab configuration
  const pages = [
    { id: 'connections', name: 'Connections', icon: Link },
    { id: 'suggestions', name: 'Suggestions', icon: Zap },
    { id: 'manual', name: 'Manual', icon: Edit }
  ];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: semanticColors.bg.primary,
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* X button - floating over content (top left) */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: spacing[5],
          left: spacing[5],
          zIndex: 10000,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: semanticColors.text.muted,
          transition: shouldReduceMotion ? 'none' : 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = semanticColors.accent.error}
        onMouseLeave={(e) => e.currentTarget.style.color = semanticColors.text.muted}
        aria-label="Close modal"
      >
        <XCircle size={32} strokeWidth={2} />
      </button>

      {/* Swipeable Page Content */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          transform: `translateX(-${currentPage * 33.333}%)`,
          transition: shouldReduceMotion ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          width: '300%',
          height: '100%'
        }}>
          {/* Page 0: Connections */}
          <div
            className="page-content"
            style={{
              width: '33.333%',
              flexShrink: 0,
              padding: `60px ${spacing[6]} 100px ${spacing[6]}`,
              overflow: 'auto',
              height: '100%'
            }}
          >
            <h2 style={{
              fontSize: fontSize['2xl'],
              fontWeight: 600,
              color: semanticColors.text.primary,
              marginBottom: spacing[6]
            }}>
              Connections
            </h2>
            {connections.map((connection) => (
              <ConnectionElement
                key={connection.id}
                provider={connection.provider}
                iconSvg={connection.iconSvg}
                iconColor={connection.iconColor}
                status={connection.status}
                onConnect={() => handleConnect(connection.id)}
              />
            ))}
          </div>

          {/* Page 1: Suggestions */}
          <div
            className="page-content"
            style={{
              width: '33.333%',
              flexShrink: 0,
              padding: `60px ${spacing[6]} 100px ${spacing[6]}`,
              overflow: 'auto',
              height: '100%'
            }}
          >
            <h2 style={{
              fontSize: fontSize['2xl'],
              fontWeight: 600,
              color: semanticColors.text.primary,
              marginBottom: spacing[6]
            }}>
              Suggestions
            </h2>
            <div style={{ color: semanticColors.text.secondary }}>
              <p>AI-powered suggestions will appear here.</p>
              <p style={{ marginTop: spacing[3], fontSize: fontSize.sm, opacity: 0.7 }}>
                Connect your accounts to get personalized suggestions.
              </p>
            </div>
          </div>

          {/* Page 2: Manual */}
          <div
            className="page-content"
            style={{
              width: '33.333%',
              flexShrink: 0,
              padding: `60px ${spacing[6]} 100px ${spacing[6]}`,
              overflow: 'auto',
              height: '100%'
            }}
          >
            <h2 style={{
              fontSize: fontSize['2xl'],
              fontWeight: 600,
              color: semanticColors.text.primary,
              marginBottom: spacing[6]
            }}>
              Manual Entry
            </h2>
            <textarea
              placeholder="Type your thought here..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: spacing[4],
                backgroundColor: semanticColors.bg.secondary,
                color: semanticColors.text.primary,
                border: `1px solid ${semanticColors.border.default}`,
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Tabs Navigation - Floating over content */}
      <div style={{
        position: 'absolute',
        bottom: spacing[5],
        left: spacing[4],
        right: spacing[4],
        zIndex: 10000,
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {pages.map((page, index) => {
            const Icon = page.icon;
            const isActive = currentPage === index;

            return (
              <div key={page.id} style={{ flex: 1, marginRight: index < pages.length - 1 ? '-2px' : '0' }}>
                <ChevronStep
                  status={isActive ? 'active_tab' : 'tab'}
                  position={index === 0 ? 'first' : index === pages.length - 1 ? 'last' : 'middle'}
                  size="micro"
                  onClick={() => setCurrentPage(index)}
                  ariaLabel={page.name}
                  width="100%"
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                </ChevronStep>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hide scrollbars but keep scrolling functionality */}
      <style jsx>{`
        :global(.page-content) {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        :global(.page-content::-webkit-scrollbar) {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default CaptureModal;
