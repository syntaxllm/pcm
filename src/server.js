// mcp server bootstrap
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./mcp/toolRegistry.js";
import { log } from "./utils/logger.js";

export async function startMcpServer() {
  const server = new McpServer({
    name: "Skarya MCP Server",
    version: "1.0.0"
  });

  registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Skarya MCP Server running on Stdio...");
  log("SERVER_START", { version: "1.0.0" });
}
