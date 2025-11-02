/**
 * Integration API Client
 *
 * Provides helper functions for managing provider integrations (Gmail, Calendar, etc.)
 * Wraps the backend integrations API for mobile app usage.
 */

import { API_BASE_URL } from './config';

// ============================================================================
// Types
// ============================================================================

export type ProviderType = 'gmail' | 'google_calendar' | 'slack';

export type IntegrationStatus =
  | 'disconnected'
  | 'connected'
  | 'connecting'
  | 'error'
  | 'token_expired';

export interface Integration {
  integration_id: string;
  provider: ProviderType;
  status: IntegrationStatus;
  provider_username?: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  connected_at: string;
}

export interface AuthorizationResponse {
  authorization_url: string;
  provider: string;
  message: string;
}

export interface ConnectionStatus {
  integration_id: string;
  provider: string;
  status: string;
  is_token_expired: boolean;
  token_expires_at: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  last_sync_status?: string;
  provider_username?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Initiate Gmail OAuth flow
 *
 * @param userId - User ID (from auth context)
 * @returns Authorization URL to open in browser
 */
export async function initiateGmailOAuth(userId: string): Promise<AuthorizationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/integrations/gmail/authorize?user_id=${userId}&mobile=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to initiate OAuth');
  }

  return response.json();
}

/**
 * List all integrations for a user
 *
 * @param userId - User ID
 * @param provider - Optional provider filter
 * @returns List of user integrations
 */
export async function listIntegrations(
  userId: string,
  provider?: ProviderType
): Promise<Integration[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/integrations/`);
  url.searchParams.append('user_id', userId);
  if (provider) {
    url.searchParams.append('provider', provider);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to list integrations');
  }

  return response.json();
}

/**
 * Get integration connection status
 *
 * @param integrationId - Integration ID
 * @returns Connection status details
 */
export async function getIntegrationStatus(
  integrationId: string
): Promise<ConnectionStatus> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/integrations/${integrationId}/status`
  );

  if (!response.ok) {
    throw new Error('Failed to get integration status');
  }

  return response.json();
}

/**
 * Disconnect an integration
 *
 * @param integrationId - Integration ID to disconnect
 */
export async function disconnectIntegration(integrationId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/integrations/${integrationId}/disconnect`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to disconnect integration');
  }
}

/**
 * Trigger manual sync for an integration
 *
 * @param integrationId - Integration ID
 */
export async function triggerSync(integrationId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/integrations/${integrationId}/sync`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to trigger sync');
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an integration exists for a provider
 *
 * @param userId - User ID
 * @param provider - Provider type
 * @returns Integration if found, null otherwise
 */
export async function findIntegrationByProvider(
  userId: string,
  provider: ProviderType
): Promise<Integration | null> {
  try {
    const integrations = await listIntegrations(userId, provider);
    return integrations.length > 0 ? integrations[0] : null;
  } catch (error) {
    console.error('Error finding integration:', error);
    return null;
  }
}

/**
 * Check if user has connected a specific provider
 *
 * @param userId - User ID
 * @param provider - Provider type
 * @returns True if connected
 */
export async function isProviderConnected(
  userId: string,
  provider: ProviderType
): Promise<boolean> {
  const integration = await findIntegrationByProvider(userId, provider);
  return integration?.status === 'connected';
}
