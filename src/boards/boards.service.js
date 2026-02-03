import fetch from "node-fetch";
import { env } from "../config/env.js";
import { log } from "../utils/logger.js";

/**
 * Service to handle Skarya Board APIs
 * Encapsulates all backend API calls with proper auth and error handling.
 */
export class BoardService {
    constructor() {
        this.baseUrl = env.SKARYA_API_URL;
    }

    /**
     * Helper to constructing headers with auth context
     * @param {Object} ctx - MCP Context containing auth info
     */
    _getHeaders(ctx) {
        if (!ctx.accessToken) {
            throw new Error("Unauthorized: Missing access token in context");
        }

        const headers = {
            "Content-Type": "application/json",
            "x-user-email": ctx.email,
            "x-workspace-id": ctx.workspaceId,
            "x-subdomain": ctx.subdomain
        };

        // If simple Bearer token
        if (!ctx.isCookie && !ctx.accessToken.includes("=")) {
            headers["Authorization"] = `Bearer ${ctx.accessToken}`;
        } else {
            // It's a cookie string (NextAuth)
            headers["Cookie"] = ctx.accessToken;
        }

        return headers;
    }

    /**
     * Helper for making API requests
     */
    async _request(endpoint, method, body, ctx) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this._getHeaders(ctx);

        log("API_REQUEST", { method, endpoint, body }); // <--- Added Body Log

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();

            log("API_RESPONSE", { endpoint, status: response.status, data }); // <--- Added Response Log

            // If success is false in body, treat as error even if status 200 (common in some APIs)
            if (!response.ok || (data.hasOwnProperty('success') && !data.success)) {
                throw new Error(`API Error ${response.status}: ${data.message || response.statusText}`);
            }

            return data;
        } catch (error) {
            // Log structured error using util logger
            log("API_REQUEST_FAILED", {
                method,
                url,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * List all boards for the current user/workspace
     * Sourced from capture: /api/boards/getBoardByUser
     */
    async listBoards(ctx) {
        // Construct query params from context
        const query = new URLSearchParams({
            workspaceId: ctx.workspaceId,
            email: ctx.email,
            subdomain: ctx.subdomain,
            accountId: ctx.accountId,
            workspaceName: "Home" // Defaulting to Home as per capture
        });

        const result = await this._request(`/api/boards/getBoardByUser?${query.toString()}`, "GET", null, ctx);

        if (result.success && Array.isArray(result.data)) {
            const boards = result.data.map(b => ({
                id: b._id,
                name: b.boardName,
                visibility: b.visibility,
                taskCount: b.taskCount,
                createdAt: b.createdAt
            }));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(boards, null, 2)
                }]
            };
        }
        return {
            content: [{
                type: "text",
                text: "[]"
            }]
        };
    }

    /**
     * Create a new board
     * Endpoint inferred: POST /api/boards/createBoard
     */
    async createBoard(params, ctx) {
        const payload = {
            boardName: params.boardName,
            visibility: params.visibility || "Public",
            description: params.description || "",
            workspaceId: ctx.workspaceId,
            email: ctx.email,
            subdomain: ctx.subdomain,
            accountId: ctx.accountId,
            createdBy: ctx.email,
            owners: [ctx.email],
            users: [ctx.email],
            userGroups: [],
            pinnedBy: [],
            isPrivate: params.visibility === "Private",
            isDefault: false
        };

        const result = await this._request("/api/boards/createBoard", "POST", payload, ctx);
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    id: result.data?._id,
                    message: "Board created successfully"
                }, null, 2)
            }]
        };
    }

    /**
     * Update an existing board
     * Endpoint inferred: PUT /api/boards/updateBoard
     */
    async updateBoard(params, ctx) {
        const payload = {
            boardId: params.boardId,
            boardName: params.boardName,
            visibility: params.visibility,
            description: params.description,
            workspaceId: ctx.workspaceId,
            accountId: ctx.accountId,
            updatedBy: ctx.email,
            subdomain: ctx.subdomain
        };

        const result = await this._request("/api/boards/updateBoard", "PUT", payload, ctx);
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Board updated successfully",
                    boardId: params.boardId
                }, null, 2)
            }]
        };
    }

    /**
     * Delete a board
     * Endpoint inferred: DELETE /api/boards/deleteBoard
     */
    async deleteBoard(params, ctx) {
        const payload = {
            boardId: params.boardId,
            workspaceId: ctx.workspaceId,
            accountId: ctx.accountId,
            email: ctx.email,
            subdomain: ctx.subdomain
        };

        const query = new URLSearchParams(payload).toString();
        await this._request(`/api/boards/deleteBoard?${query}`, "DELETE", null, ctx);
        return {
            content: [{
                type: "text",
                text: "Board deleted successfully"
            }]
        };
    }

    /**
     * Assign users to a board
     * Endpoint inferred: POST /api/boards/addMember
     */
    async assignUsers(params, ctx) {
        const payload = {
            boardId: params.boardId,
            users: params.emails,
            workspaceId: ctx.workspaceId,
            accountId: ctx.accountId,
            subdomain: ctx.subdomain
        };

        await this._request("/api/boards/addMember", "POST", payload, ctx);
        return {
            content: [{
                type: "text",
                text: `Users assigned to board ${params.boardId}`
            }]
        };
    }

    /**
     * Apply a template to create a board
     * Source: Validated from previous codebase
     */
    async applyTemplate(params, ctx) {
        const payload = {
            boardName: params.boardName,
            template: { id: params.templateId || "agile-board" },
            workspaceId: ctx.workspaceId,
            accountId: ctx.accountId,
            email: ctx.email,
            subdomain: ctx.subdomain,
            createdBy: ctx.email,
            visibility: params.visibility || "Public",
            owners: [ctx.email],
            users: [ctx.email],
            userGroups: [],
            pinnedBy: [],
            isPrivate: params.visibility === "Private"
        };

        const result = await this._request("/api/boards/applyTemplate", "POST", payload, ctx);
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    id: result.board?._id,
                    message: "Template applied successfully",
                    templateResult: result.templateResult
                }, null, 2)
            }]
        };
    }

    /**
     * Get potential assignees for the workspace
     * Verified Endpoint: /api/boards/getFilterAssignee
     */
    async getAssignees(ctx) {
        const query = new URLSearchParams({
            workspaceId: ctx.workspaceId,
            accountId: ctx.accountId,
            subdomain: ctx.subdomain
        });

        const result = await this._request(`/api/boards/getFilterAssignee?${query.toString()}`, "GET", null, ctx);

        if (result.success && result.data && Array.isArray(result.data.users)) {
            const assignees = result.data.users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.roleName
            }));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(assignees, null, 2)
                }]
            };
        }
        return { content: [{ type: "text", text: "[]" }] };
    }

    /**
     * Get specific board details by ID
     * Verified Endpoint: /api/boards/getBoardById&Access
     */
    async getBoard(params, ctx) {
        const query = new URLSearchParams({
            id: params.boardId, // In capture it's 'id'
            email: ctx.email,
            workspaceId: ctx.workspaceId,
            accountId: ctx.accountId,
            subdomain: ctx.subdomain
        });

        const result = await this._request(`/api/boards/getBoardById&Access?${query.toString()}`, "GET", null, ctx);

        if (result.success && result.data) {
            const b = result.data;
            const boardDetails = {
                id: b._id,
                name: b.boardName,
                visibility: b.visibility,
                description: b.description,
                owners: b.owners,
                createdAt: b.createdAt,
                taskCount: b.taskCounter
            };
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(boardDetails, null, 2)
                }]
            };
        }
        throw new Error("Board not found");
    }
}

export const boardService = new BoardService();
