// mcp server bootstrap
import { McpServer } from "@modelcontextprotocol/sdk/server";
import { registerTools } from "./mcp/toolRegistry.js";

export function startMcpServer() {
  const server = new McpServer({
    name: "Skarya MCP Server",
    version: "1.0.0"
  });

  registerTools(server);

  server.start();
}
