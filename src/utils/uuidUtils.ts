/**
 * Convert a Clerk user ID to a deterministic UUID
 * This ensures the same Clerk user ID always generates the same UUID
 */
export function clerkUserIdToUuid(clerkUserId: string): string {
  // Create a simple deterministic UUID-like string from the Clerk ID
  // This is a hash-based conversion that always produces the same result for the same input
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < clerkUserId.length; i++) {
    const char = clerkUserId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and format as hex
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Create a second hash for more entropy
  let hash2 = 0;
  for (let i = clerkUserId.length - 1; i >= 0; i--) {
    const char = clerkUserId.charCodeAt(i);
    hash2 = ((hash2 << 3) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  const positiveHash2 = Math.abs(hash2).toString(16).padStart(8, '0');
  
  // Format as UUID v4
  return [
    positiveHash.substring(0, 8),
    positiveHash.substring(8, 12) || '0000',
    '4' + positiveHash2.substring(1, 4), // Version 4
    '8' + positiveHash2.substring(4, 7), // Variant bits
    positiveHash2.substring(0, 12).padEnd(12, '0')
  ].join('-');
}

/**
 * Generate a random UUID v4
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}