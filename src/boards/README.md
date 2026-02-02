# Skarya MCP Boards Module

This module implements the Model Context Protocol (MCP) tools for managing Skarya Boards.

## Structure

- **`boards.tools.js`**: Registers the MCP tools (`list_boards`, `create_board`, `update_board`, `delete_board`, `assign_users`, `apply_template`).
- **`boards.service.js`**: Handles business logic and API communication. Inject auth headers (token, email, subdomain) from the MCP context.
- **`boards.schema.js`**: Defines standard JSON schemas for tool inputs.

## Authentication

All tools require an authenticated MCP session. The `BoardService` expects the following context variables to be present in `ctx`:
- `accessToken`: Bearer token for API access.
- `email`: User's email address.
- `subdomain`: Workspace subdomain.
- `workspaceId`: ID of the current workspace.

## API Notes

Some endpoints were inferred as they were not present in the capture file. **These need verification**:
- `POST /api/boards/createBoard`
- `PUT /api/boards/updateBoard`
- `DELETE /api/boards/deleteBoard` (via query params)
- `POST /api/boards/addMember`

Unsupported features removed based on capture analysis:
- `folderId` in board creation
- Board status updates (endpoints not found)
