import { boardService } from "./boards.service.js";
import {
    ListBoardsSchema,
    CreateBoardSchema,
    UpdateBoardSchema,
    DeleteBoardSchema,
    AssignUsersSchema,
    ApplyTemplateSchema
} from "./boards.schema.js";

/**
 * Register Board Tools
 * @param {McpServer} server - The MCP Server instance
 */
export function registerBoardTools(server) {

    // Tool: List Boards
    server.tool(
        "list_boards",
        {
            description: "List all boards accessible to the current user in the workspace.",
            inputSchema: ListBoardsSchema
        },
        async (input, toolCtx) => {
            // Auth is handled by middleware injecting into ctx, service uses ctx
            const ctx = toolCtx.request?.context || toolCtx;
            return await boardService.listBoards(ctx);
        }
    );

    // Tool: Create Board
    server.tool(
        "create_board",
        {
            description: "Create a new board in the workspace.",
            inputSchema: CreateBoardSchema
        },
        async (input, toolCtx) => {
            const ctx = toolCtx.request?.context || toolCtx;
            return await boardService.createBoard(input, ctx);
        }
    );

    // Tool: Update Board
    server.tool(
        "update_board",
        {
            description: "Update an existing board's details (name, visibility, etc).",
            inputSchema: UpdateBoardSchema
        },
        async (input, toolCtx) => {
            const ctx = toolCtx.request?.context || toolCtx;
            return await boardService.updateBoard(input, ctx);
        }
    );

    // Tool: Delete Board
    server.tool(
        "delete_board",
        {
            description: "Delete a board by ID permanently.",
            inputSchema: DeleteBoardSchema
        },
        async (input, toolCtx) => {
            const ctx = toolCtx.request?.context || toolCtx;
            return await boardService.deleteBoard(input, ctx);
        }
    );

    // Tool: Assign Users
    server.tool(
        "assign_users",
        {
            description: "Assign members to a board using their emails.",
            inputSchema: AssignUsersSchema
        },
        async (input, toolCtx) => {
            const ctx = toolCtx.request?.context || toolCtx;
            return await boardService.assignUsers(input, ctx);
        }
    );

    // Tool: Apply Template
    server.tool(
        "apply_template",
        {
            description: "Create a new board using a specific template.",
            inputSchema: ApplyTemplateSchema
        },
        async (input, toolCtx) => {
            const ctx = toolCtx.request?.context || toolCtx;
            return await boardService.applyTemplate(input, ctx);
        }
    );

    // Note: update_statuses was removed as it was not supported by the API capture.
}
