import { googleAuth } from './auth';

export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID.trim()) ||
  '1094871067975-vrrhfem71sseh67g6lsfugtdvq4e9k6c.apps.googleusercontent.com';

/**
 * Triggers authentic Google OAuth 2.0 popup using Google Identity Services (GIS).
 * Opens Google's official 'Sign in with Google' popup (accounts.google.com).
 * Displays saved Gmail accounts from the user's browser, or prompts for email/password.
 */
export function promptGoogleLogin({ role = 'PATIENT', promptMode = 'select_account' } = {}) {
  return new Promise((resolve, reject) => {
    const clientId = GOOGLE_CLIENT_ID;

    if (!window.google?.accounts?.oauth2) {
      const err = new Error(
        'Google Identity Services SDK is not loaded yet. Please verify internet connection and refresh.'
      );
      err.code = 'SDK_NOT_LOADED';
      return reject(err);
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            return reject(new Error(tokenResponse.error_description || tokenResponse.error));
          }

          if (!tokenResponse.access_token) {
            return reject(new Error('No access token returned from Google authentication.'));
          }

          try {
            // Send verified Google access token to backend
            const session = await googleAuth({
              accessToken: tokenResponse.access_token,
              role,
            });
            resolve(session);
          } catch (apiErr) {
            reject(apiErr);
          }
        },
        error_callback: (err) => {
          reject(new Error(err?.message || 'Google Sign-In popup closed or cancelled.'));
        },
      });

      // Request access token with prompt to select from saved Gmail accounts in browser
      tokenClient.requestAccessToken({ prompt: promptMode });
    } catch (e) {
      reject(e);
    }
  });
}
