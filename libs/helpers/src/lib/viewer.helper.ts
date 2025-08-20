/**
 * Helper functions for viewer ID management
 */

/**
 * Generate a guest viewer ID
 * @returns A unique guest viewer ID in format: guest-{timestamp}-{random}
 */
export function generateGuestViewerId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `guest-${timestamp}-${random}`;
}

/**
 * Check if a viewer ID is for a guest user
 * @param viewerId The viewer ID to check
 * @returns true if it's a guest viewer ID
 */
export function isGuestViewerId(viewerId: string): boolean {
  return viewerId.startsWith('guest-');
}

/**
 * Get or create viewer ID from localStorage
 * @returns The viewer ID (either existing or newly created)
 */
export function getOrCreateViewerId(): string {
  if (typeof window === 'undefined') {
    // Server-side, return a temporary ID
    return generateGuestViewerId();
  }

  let viewerId = localStorage.getItem('viewerId');
  if (!viewerId) {
    viewerId = generateGuestViewerId();
    localStorage.setItem('viewerId', viewerId);
  }
  return viewerId;
}

/**
 * Clear viewer ID from localStorage
 */
export function clearViewerId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('viewerId');
  }
}
