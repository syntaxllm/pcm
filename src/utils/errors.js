export class McpError extends Error {
  constructor(message, code = "MCP_ERROR") {
    super(message);
    this.code = code;
  }
}
