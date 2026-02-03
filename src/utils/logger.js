import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../'); // Go up from src/utils to root

const LOG_DIR = path.join(PROJECT_ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'mcp.log');

// Ensure log directory exists immediately
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create log dir:", e);
  }
}

export function log(event, data = {}) {
  const logEntry = JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ...data
  });

  // 1. Log to stderr (standard MCP practice for logs)
  console.error(logEntry);

  // 2. Append to file (for user live-tailing)
  try {
    fs.appendFileSync(LOG_FILE, logEntry + '\n');
  } catch (err) {
    // Fail silently on file write to avoid crashing server
    console.error("Log file write failed:", err.message);
  }
}
