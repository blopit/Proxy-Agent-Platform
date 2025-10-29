'use client'

import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import ChevronButton from './ChevronButton';

/**
 * ConnectionElement - Individual connection item for Connections section
 *
 * Layout: [Icon] Provider Name          [Status/Button]
 *
 * Statuses:
 * - disconnected: Show "Connect" button
 * - connected: Show "Connected" with checkmark
 * - error: Show "Error" with alert icon
 * - connecting: Show "Connecting..." with loading spinner
 */

export type ConnectionStatus = 'disconnected' | 'connected' | 'error' | 'connecting';

export interface ConnectionElementProps {
  provider: string;
  iconSvg: string; // SVG path data from simple-icons
  iconColor: string; // Brand color from simple-icons
  status: ConnectionStatus;
  onConnect?: () => void;
  className?: string;
}

const ConnectionElement: React.FC<ConnectionElementProps> = ({
  provider,
  iconSvg,
  iconColor,
  status,
  onConnect,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'var(--color-green)';
      case 'error':
        return 'var(--color-red)';
      case 'connecting':
        return 'var(--color-yellow)';
      case 'disconnected':
      default:
        return 'var(--color-blue)';
    }
  };

  const renderStatus = () => {
    const buttonWidth = '120px'; // Fixed width for consistent alignment

    switch (status) {
      case 'disconnected':
        return (
          <ChevronButton
            variant="primary"
            onClick={onConnect}
            ariaLabel="Connect"
            width={buttonWidth}
          >
            Connect
          </ChevronButton>
        );

      case 'connected':
        return (
          <ChevronButton
            variant="success"
            ariaLabel="Connected"
            width={buttonWidth}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Check size={14} strokeWidth={2.5} />
              <span>Connected</span>
            </div>
          </ChevronButton>
        );

      case 'error':
        return (
          <ChevronButton
            variant="error"
            onClick={onConnect}
            ariaLabel="Error - Retry"
            width={buttonWidth}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle size={14} strokeWidth={2.5} />
              <span>Retry</span>
            </div>
          </ChevronButton>
        );

      case 'connecting':
        return (
          <ChevronButton
            variant="warning"
            disabled
            ariaLabel="Connecting"
            width={buttonWidth}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
              <span>Connecting...</span>
            </div>
          </ChevronButton>
        );
    }
  };

  return (
    <div
      className={`connection-element ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--secondary-bg-color)',
        border: `1px solid ${getStatusColor()}`,
        borderRadius: '6px',
        marginBottom: '8px',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}
    >
      {/* Left: Brand Icon (SVG) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flex: 1
      }}>
        <div style={{ flexShrink: 0 }}>
          <svg
            role="img"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={iconSvg} fill={iconColor} />
          </svg>
        </div>

        {/* Middle: Provider Name */}
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-color)',
        }}>
          {provider}
        </div>
      </div>

      {/* Right: Status/Button */}
      <div style={{ flexShrink: 0 }}>
        {renderStatus()}
      </div>

      {/* Spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        :global(.animate-spin) {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ConnectionElement;
