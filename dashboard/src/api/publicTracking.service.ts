/**
 * Public Tracking API Service
 * 
 * Public endpoints that don't require authentication.
 * Access controlled via secure tracking tokens only.
 */

import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { PublicClaimDetails } from "../types/publicTracking";

/**
 * Get claim details by tracking token (public endpoint)
 * 
 * No authentication required - access via secure 64-character token
 * Rate limited to prevent brute-force attacks
 * 
 * @param token - Secure tracking token (64 characters)
 * @returns Public claim details (sanitized, no sensitive data)
 * @throws 404 if token is invalid or expired
 * @throws 429 if rate limit exceeded
 */
export async function getClaimByToken(
  token: string,
): Promise<PublicClaimDetails> {
  const response = await apiClient.get<ApiResponse<PublicClaimDetails>>(
    `/public/claims/track/${token}`,
  );

  return response.data.data;
}

/**
 * Validate tracking token format (client-side check)
 * Token should be 64 characters (alphanumeric + special chars)
 */
export function isValidTrackingToken(token: string): boolean {
  // Token format: 64 characters, alphanumeric + hyphens/underscores
  const tokenRegex = /^[A-Za-z0-9_-]{64}$/;
  return tokenRegex.test(token);
}
