import { buildContext } from "../mcp/contextBuilder.js";

/**
 * Higher-order function to wrap tool handlers with Authentication.
 * Usage: async (input, ctx) => await withAuth(ctx, async (authCtx) => { ... })
 * OR simply wrapped: withAuthWrapper(async (input, authCtx) => { ... })
 */
export async function withAuth(toolCtx, handler, input) {
  try {
    let authContext = {};

    // DEV AUTH BYPASS
    if (process.env.NODE_ENV === "development" && process.env.DEV_ACCESS_TOKEN) {
      if (process.env.DEV_NO_AUTH === "true") {
        // Log only once per session ideally, but okay for now
        // console.warn("[Auth] No-Auth Mode"); 
      }

      const token = process.env.DEV_ACCESS_TOKEN;
      const isCookie = token.includes("next-auth.session-token") || token.includes("Cookie");

      authContext = {
        accessToken: token,
        workspaceId: process.env.DEV_WORKSPACE_ID,
        subdomain: process.env.DEV_SUBDOMAIN,
        email: process.env.DEV_EMAIL,
        accountId: process.env.DEV_ACCOUNT_ID, // Added
        isCookie: isCookie
      };
    } else {
      // Standard MCP Auth
      // Note: toolCtx usually does not have sessionId directly exposed in all implementations,
      // but we will assume we can get it or fallback.
      const sessionId = toolCtx?.sessionId || "unknown";
      authContext = await buildContext(sessionId);
    }

    // Execute handler with injected auth context
    // We merge request input and auth context if needed, or pass authContext as second arg
    // Handler signature: (input, authCtx)
    return await handler(input, authContext);

  } catch (err) {
    console.error("Auth Error:", err);
    throw new Error(`Authentication failed: ${err.message}`);
  }
}
