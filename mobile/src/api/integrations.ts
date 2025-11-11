/**
 * Integration API Client
 *
 * Provides helper functions for managing provider integrations (Gmail, Calendar, etc.)
 * Wraps the backend integrations API for mobile app usage.
 */

import { API_BASE_URL } from './config';
import { apiGet, apiPost } from './apiClient';

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
 * @param userId - User ID (from auth context) - not used but kept for compatibility
 * @param token - JWT access token for authentication - not used (handled by apiClient)
 * @returns Authorization URL to open in browser
 */
export async function initiateGmailOAuth(
  userId: string,
  token: string
): Promise<AuthorizationResponse> {
  const response = await apiPost(
    `${API_BASE_URL}/integrations/gmail/authorize?mobile=true`
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
 * @param userId - User ID - not used but kept for compatibility
 * @param token - JWT access token for authentication - not used (handled by apiClient)
 * @param provider - Optional provider filter
 * @returns List of user integrations
 */
export async function listIntegrations(
  userId: string,
  token: string,
  provider?: ProviderType
): Promise<Integration[]> {
  const url = new URL(`${API_BASE_URL}/integrations/`);
  if (provider) {
    url.searchParams.append('provider', provider);
  }

  const response = await apiGet(url.toString());

  if (!response.ok) {
    throw new Error('Failed to list integrations');
  }

  return response.json();
}

/**
 * Get integration connection status
 *
 * @param integrationId - Integration ID
 * @param token - JWT access token for authentication - not used (handled by apiClient)
 * @returns Connection status details
 */
export async function getIntegrationStatus(
  integrationId: string,
  token: string
): Promise<ConnectionStatus> {
  const response = await apiGet(
    `${API_BASE_URL}/integrations/${integrationId}/status`
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
 * @param token - JWT access token for authentication - not used (handled by apiClient)
 */
export async function disconnectIntegration(
  integrationId: string,
  token: string
): Promise<void> {
  const response = await apiPost(
    `${API_BASE_URL}/integrations/${integrationId}/disconnect`
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
 * @param token - JWT access token for authentication - not used (handled by apiClient)
 */
export async function triggerSync(integrationId: string, token: string): Promise<void> {
  const response = await apiPost(
    `${API_BASE_URL}/integrations/${integrationId}/sync`
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
 * @param token - JWT access token for authentication
 * @param provider - Provider type
 * @returns Integration if found, null otherwise
 */
export async function findIntegrationByProvider(
  userId: string,
  token: string,
  provider: ProviderType
): Promise<Integration | null> {
  try {
    const integrations = await listIntegrations(userId, token, provider);
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
 * @param token - JWT access token for authentication
 * @param provider - Provider type
 * @returns True if connected
 */
export async function isProviderConnected(
  userId: string,
  token: string,
  provider: ProviderType
): Promise<boolean> {
  const integration = await findIntegrationByProvider(userId, token, provider);
  return integration?.status === 'connected';
}
