// Register MCP tools
/*const toolRegistry = require('./mcp/toolRegistry');
toolRegistry.registerTool('codeFormatter', require('./tools/codeFormatter'));
toolRegistry.registerTool('bugFinder', require('./tools/bugFinder'));
toolRegistry.registerTool('testGenerator', require('./tools/testGenerator'));
module.exports = toolRegistry;
*/
import { registerBoardTools } from "../boards/boards.tools.js";
import { registerTaskTools } from "../tasks/tasks.tools.js";


export function registerTools(server) {
  // Domain-specific tools
  registerBoardTools(server);
  registerTaskTools(server);
}
