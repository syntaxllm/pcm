// In-memory / redis backed session store for authentication sessions  [later] 
const sessions = new Map();
// key: mcpSessionId → { user, workspace, expiresAt }

export function saveSession(id, data) {
  sessions.set(id, data);
}

export function getSession(id) {
  return sessions.get(id);
}
