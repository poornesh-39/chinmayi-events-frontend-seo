/**
 * Admin session handling for the browser.
 *
 * The token lives in sessionStorage rather than localStorage so it dies with
 * the tab — an admin panel opened on a shared or borrowed machine does not
 * stay signed in after the window closes. It is never the security boundary
 * either way: the server verifies the JWT on every request, and losing the
 * token only means signing in again.
 */
import { apiUrl } from './site.js';

const TOKEN_KEY = 'ce_admin_token';

export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* Private mode or blocked storage — the session just won't survive a reload. */
  }
};

export const clearToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Nothing to clear. */
  }
};

/** Raised when the server rejects the session, so callers can sign the user out. */
export class UnauthorizedError extends Error {
  constructor(message = 'Session expired, please sign in again') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * fetch() for admin endpoints: attaches the bearer token and turns a 401 into
 * a typed error, so no call site has to remember to check for one.
 */
export const authFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    let message;
    try {
      message = (await response.json()).message;
    } catch {
      /* Non-JSON body — fall back to the default wording. */
    }
    throw new UnauthorizedError(message);
  }

  return response;
};

export const login = async (email, password) => {
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Could not sign in.');
  }

  setToken(data.token);
  return data.admin;
};

/** Confirms a stored token is still valid before showing the dashboard. */
export const restoreSession = async () => {
  if (!getToken()) return null;

  try {
    const response = await authFetch('/api/auth/me');
    if (!response.ok) return null;
    return (await response.json()).admin;
  } catch {
    return null;
  }
};

export const logout = () => clearToken();
