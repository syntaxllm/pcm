# Skarya MCP Server

This is the Model Context Protocol (MCP) server integration for Skarya.ai, enabling LLMs (like ChatGPT and Claude) to interact with Skarya boards, tasks, and workflows.

## Features

- **Boards Management**: List, create, update, and manage boards.
- **Tasks Management**: List, create, and update tasks within boards.
- **Tenant Isolation**: Fully supports Skarya's multi-tenant architecture with subdomain and workspace isolation.
- **Secure Auth**: Uses session-based authentication injection for safe LLM interaction.

## Modules

- **`src/boards/`**: Core logic for Board operations (Tools, Service, Schema).
- **`src/tasks/`**: Core logic for Task operations.
- **`src/mcp/`**: MCP server configuration and tool registry.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file (see `.env.example` if available) with:
    ```env
    SKARYA_API_URL=https://app.skarya.ai
    ```

3.  **Run Server**:
    ```bash
    npm start
    ```

## Development

- **Tools Definition**: New tools are defined in their respective modules (e.g., `src/boards/boards.tools.js`) and registered in `src/mcp/toolRegistry.js`.
- **API Capture**: Refer to `src/utils/boards-api-capture.json` for API contract details.
