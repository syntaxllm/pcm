/**
 * JSON Schemas for Task Operations
 * Based on 'boards-api-capture.json' data structures.
 */

const taskId = { type: "string", description: "The unique identifier of the task" };
const boardId = { type: "string", description: "The ID of the board the task belongs to" };
const status = { type: "string", description: "Status of the task (e.g., 'To Do', 'In Progress', 'Done')" };
const priority = { type: "string", enum: ["Low", "Medium", "High", "Critical"], description: "Priority level" };

/**
 * List Tasks
 * Requires boardId to filter tasks.
 */
export const ListTasksSchema = {
    type: "object",
    properties: {
        boardId
    },
    required: ["boardId"]
};

/**
 * Create Task
 * Inferred structure. Common fields from capture responses.
 */
export const CreateTaskSchema = {
    type: "object",
    properties: {
        boardId,
        name: { type: "string", description: "Title of the task" },
        description: { type: "string" },
        status,
        priority,
        dueDate: { type: "string", format: "date-time" },
        assigneeEmail: { type: "string", format: "email", description: "Email of the assigned user" }
    },
    required: ["boardId", "name"]
};

/**
 * Update Task
 */
export const UpdateTaskSchema = {
    type: "object",
    properties: {
        taskId,
        boardId, // Often required for permission checks
        name: { type: "string" },
        description: { type: "string" },
        status,
        priority,
        dueDate: { type: "string", format: "date-time" },
        assigneeEmail: { type: "string", format: "email" }
    },
    required: ["taskId", "boardId"]
};
