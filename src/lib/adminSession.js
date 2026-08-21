export const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const sessionStartedAtKey = "zenlove_admin_session_started_at";

export function startAdminSession() {
  localStorage.setItem(sessionStartedAtKey, String(Date.now()));
}

export function clearAdminSession() {
  localStorage.removeItem(sessionStartedAtKey);
}

export function isAdminSessionExpired() {
  const startedAt = Number(localStorage.getItem(sessionStartedAtKey));

  if (!startedAt) {
    startAdminSession();
    return false;
  }

  return Date.now() - startedAt >= ADMIN_SESSION_MAX_AGE_MS;
}

export function remainingAdminSessionMs() {
  const startedAt = Number(localStorage.getItem(sessionStartedAtKey));
  return Math.max(0, ADMIN_SESSION_MAX_AGE_MS - (Date.now() - startedAt));
}
