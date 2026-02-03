import { boardService } from "./boards.service.js";
import {
    ListBoardsSchema,
    CreateBoardSchema,
    UpdateBoardSchema,
    DeleteBoardSchema,
    AssignUsersSchema,
    ApplyTemplateSchema,
    GetBoardSchema,
    GetAssigneesSchema
} from "./boards.schema.js";

/**
 * Register Board Tools
 * @param {McpServer} server - The MCP Server instance
 */
import { withAuth } from "../middleware/requireAuth.js";

// ... schemas ...

export function registerBoardTools(server) {

    // Tool: List Boards
    server.tool(
        "list_boards",
        {
            description: "List all boards accessible to the current user in the workspace.",
            inputSchema: ListBoardsSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.listBoards(authCtx);
        }, input)
    );

    // Tool: Get Board
    server.tool(
        "get_board",
        {
            description: "Get detailed information about a specific board.",
            inputSchema: GetBoardSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.getBoard(inp, authCtx);
        }, input)
    );

    // Tool: Get Assignees
    server.tool(
        "get_assignees",
        {
            description: "Get a list of potential assignees (users) for the workspace.",
            inputSchema: GetAssigneesSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.getAssignees(authCtx);
        }, input)
    );

    // Tool: Create Board
    server.tool(
        "create_board",
        {
            description: "Create a new board in the workspace.",
            inputSchema: CreateBoardSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.createBoard(inp, authCtx);
        }, input)
    );

    // Tool: Update Board
    server.tool(
        "update_board",
        {
            description: "Update an existing board's details (name, visibility, etc).",
            inputSchema: UpdateBoardSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.updateBoard(inp, authCtx);
        }, input)
    );

    // Tool: Delete Board
    server.tool(
        "delete_board",
        {
            description: "Delete a board by ID permanently.",
            inputSchema: DeleteBoardSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.deleteBoard(inp, authCtx);
        }, input)
    );

    // Tool: Assign Users
    server.tool(
        "assign_users",
        {
            description: "Assign members to a board using their emails.",
            inputSchema: AssignUsersSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.assignUsers(inp, authCtx);
        }, input)
    );

    // Tool: Apply Template
    server.tool(
        "apply_template",
        {
            description: "Create a new board using a specific template.",
            inputSchema: ApplyTemplateSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await boardService.applyTemplate(inp, authCtx);
        }, input)
    );

    // Note: update_statuses was removed as it was not supported by the API capture.
}
