// mcp entry point
import "dotenv/config";
import { startMcpServer } from "./server.js";

// Redirect all console.log to console.error to prevent stdout corruption in MCP
console.log = console.error;

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startMcpServer();
