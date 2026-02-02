import { taskService } from "./tasks.service.js";
import {
    ListTasksSchema,
    CreateTaskSchema,
    UpdateTaskSchema
} from "./tasks.schema.js";

/**
 * Register Task Tools
 * @param {McpServer} server - The MCP Server instance
 */
import { withAuth } from "../middleware/requireAuth.js";

// ...

export function registerTaskTools(server) {

    // Tool: List Tasks
    server.tool(
        "list_tasks",
        {
            description: "List all tasks within a specific board.",
            inputSchema: ListTasksSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await taskService.listTasks(inp, authCtx);
        }, input)
    );

    // Tool: Create Task
    server.tool(
        "create_task",
        {
            description: "Create a new task on a board.",
            inputSchema: CreateTaskSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await taskService.createTask(inp, authCtx);
        }, input)
    );

    // Tool: Update Task
    server.tool(
        "update_task",
        {
            description: "Update a task's details (status, priority, assignee, etc).",
            inputSchema: UpdateTaskSchema
        },
        async (input, toolCtx) => withAuth(toolCtx, async (inp, authCtx) => {
            return await taskService.updateTask(inp, authCtx);
        }, input)
    );
}
