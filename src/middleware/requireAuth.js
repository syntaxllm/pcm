import { buildContext } from "../mcp/contextBuilder.js";

export async function requireAuth(req, next) {
  try {
    // MCP session id comes from MCP runtime
    const mcpSessionId = req.sessionId;

    // DEV AUTH BYPASS
    if (process.env.NODE_ENV === "development" && process.env.DEV_ACCESS_TOKEN) {
      console.warn("[Auth] Using Dev Auth Mode (Bypassing MCP Context)");
      req.context = {
        accessToken: process.env.DEV_ACCESS_TOKEN,
        workspaceId: process.env.DEV_WORKSPACE_ID,
        subdomain: process.env.DEV_SUBDOMAIN,
        email: process.env.DEV_EMAIL
      };
      return next(req);
    }

    const ctx = await buildContext(mcpSessionId);
    req.context = ctx;

    return next(req);
  } catch (err) {
    throw new Error("Authentication required for MCP access");
  }
}
