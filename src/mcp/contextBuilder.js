//  Build user / workspace context for MCP operations
/*class ContextBuilder {
    constructor(userService, workspaceService) {
        this.userService = userService;
        this.workspaceService = workspaceService;
    }
    async buildContext(userId, workspaceId) {
        const user = await this.userService.getUserById(userId);
        const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
        return {
            user,
            workspace
        };
    }
}
module.exports = ContextBuilder;*/

import { getSession } from "../auth/sessionStore.js";
import { getShortLivedToken } from "../auth/tokenService.js";

export async function buildContext(mcpSessionId) {
  const session = getSession(mcpSessionId);

  if (!session) throw new Error("Unauthenticated MCP session");

  const token = await getShortLivedToken(session);

  return {
    ...session,
    accessToken: token.accessToken
  };
}
