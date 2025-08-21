// src/lib/utils.ts

/**
 * Returns the base URL of the application.
 * This is useful for constructing absolute URLs, for example in emails.
 */
export const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    // Vercel deployment
    return `https://${process.env.VERCEL_URL}`;
  }
  // Local development
  return 'http://localhost:3000';
};
