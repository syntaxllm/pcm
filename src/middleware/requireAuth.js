import { buildContext } from "../mcp/contextBuilder.js";

export async function requireAuth(req, next) {
  try {
    // MCP session id comes from MCP runtime
    const mcpSessionId = req.sessionId;

    const ctx = await buildContext(mcpSessionId);
    req.context = ctx;

    return next(req);
  } catch (err) {
    throw new Error("Authentication required for MCP access");
  }
}
