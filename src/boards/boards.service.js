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
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ctx.accessToken}`,
            "x-user-email": ctx.email,
            "x-workspace-id": ctx.workspaceId,
            "x-subdomain": ctx.subdomain
        };
    }

    /**
     * Helper for making API requests
     */
    async _request(endpoint, method, body, ctx) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this._getHeaders(ctx);

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();

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
            accountId: ctx.accountId
        });

        // Using encoded URI component to handle special chars if any
        const result = await this._request(`/api/boards/getBoardByUser?${query.toString()}`, "GET", null, ctx);

        if (result.success && Array.isArray(result.data)) {
            return result.data.map(b => ({
                id: b._id,
                name: b.boardName,
                visibility: b.visibility,
                taskCount: b.taskCount,
                createdAt: b.createdAt
            }));
        }
        return [];
    }

    /**
     * Create a new board
     * Endpoint inferred: POST /api/boards/createBoard
     * Note: 'folderId' removed as it is not in capture.
     */
    async createBoard(params, ctx) {
        const payload = {
            boardName: params.boardName,
            visibility: params.visibility || "Public",
            description: params.description || "",
            workspaceId: ctx.workspaceId,
            createdBy: ctx.email,
            subdomain: ctx.subdomain,
            accountId: ctx.accountId
        };

        const result = await this._request("/api/boards/createBoard", "POST", payload, ctx);
        return {
            id: result.data?._id,
            message: "Board created successfully"
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
            updatedBy: ctx.email
        };

        const result = await this._request("/api/boards/updateBoard", "PUT", payload, ctx);
        return {
            message: "Board updated successfully",
            boardId: params.boardId
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
            email: ctx.email
        };

        const query = new URLSearchParams(payload).toString();
        await this._request(`/api/boards/deleteBoard?${query}`, "DELETE", null, ctx);
        return { message: "Board deleted successfully" };
    }

    /**
     * Assign users to a board
     * Endpoint inferred: POST /api/boards/addMember
     */
    async assignUsers(params, ctx) {
        const payload = {
            boardId: params.boardId,
            users: params.emails,
            workspaceId: ctx.workspaceId
        };

        await this._request("/api/boards/addMember", "POST", payload, ctx);
        return { message: `Users assigned to board ${params.boardId}` };
    }

    /**
     * Apply a template to create a board
     * Source: Validated from previous codebase
     */
    async applyTemplate(params, ctx) {
        const payload = {
            boardName: params.boardName,
            template: { id: params.templateId },
            workspaceId: ctx.workspaceId,
            subdomain: ctx.subdomain,
            createdBy: ctx.email
        };

        const result = await this._request("/api/boards/applyTemplate", "POST", payload, ctx);
        return {
            id: result.board?._id,
            message: "Template applied successfully"
        };
    }
}

export const boardService = new BoardService();
