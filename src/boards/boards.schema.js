/**
 * JSON Schemas for Board Operations
 * Strictly based on boards-api-capture.json to avoid unsupported fields.
 */

const boardId = { type: "string", description: "The unique identifier of the board" };
const visibility = { type: "string", enum: ["Public", "Private"], description: "Visibility level of the board" };

/**
 * List Boards
 * Minimal inputs as context (workspaceId, email) handles most filtering
 */
export const ListBoardsSchema = {
    type: "object",
    properties: {},
    required: []
};

/**
 * Get Board
 */
export const GetBoardSchema = {
    type: "object",
    properties: {
        boardId: { type: "string", description: "The ID of the board to retrieve" }
    },
    required: ["boardId"]
};

/**
 * Get Assignees
 * No params needed as it uses workspaceId from context
 */
export const GetAssigneesSchema = {
    type: "object",
    properties: {},
    required: []
};

/**
 * Create Board
 * Removed folderId, as it does not appear in valid capture payloads.
 */
export const CreateBoardSchema = {
    type: "object",
    properties: {
        boardName: { type: "string", description: "Name of the new board" },
        visibility, // Confirmed in capture (e.g., "Public")
        description: { type: "string" }
    },
    required: ["boardName"]
};

/**
 * Update Board
 */
export const UpdateBoardSchema = {
    type: "object",
    properties: {
        boardId,
        boardName: { type: "string" },
        visibility,
        description: { type: "string" }
    },
    required: ["boardId"]
};

/**
 * Delete Board
 */
export const DeleteBoardSchema = {
    type: "object",
    properties: {
        boardId
    },
    required: ["boardId"]
};

/**
 * Assign Users
 * Simple email list
 */
export const AssignUsersSchema = {
    type: "object",
    properties: {
        boardId,
        emails: {
            type: "array",
            items: { type: "string", format: "email" },
            description: "List of user emails to assign"
        }
    },
    required: ["boardId", "emails"]
};

/**
 * Apply Template
 * Confirmed structure from capture/legacy code
 */
export const ApplyTemplateSchema = {
    type: "object",
    properties: {
        boardName: { type: "string" },
        templateId: { type: "string" }
    },
    required: ["boardName", "templateId"]
};

// Removed UpdateStatusesSchema as it wasn't explicitly found in the capture 200 responses
