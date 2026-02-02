import fetch from "node-fetch";
import { env } from "../config/env.js";
import { log } from "../utils/logger.js";

/**
 * Service to handle Skarya Task APIs
 */
export class TaskService {
    constructor() {
        this.baseUrl = env.SKARYA_API_URL;
    }

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

        if (!ctx.isCookie && !ctx.accessToken.includes("=")) {
            headers["Authorization"] = `Bearer ${ctx.accessToken}`;
        } else {
            headers["Cookie"] = ctx.accessToken;
        }

        return headers;
    }

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

            if (!response.ok || (data.hasOwnProperty('success') && !data.success)) {
                throw new Error(`API Error ${response.status}: ${data.message || response.statusText}`);
            }

            return data;
        } catch (error) {
            log("API_REQUEST_FAILED", { method, url, error: error.message });
            throw error;
        }
    }

    /**
     * List tasks for a specific board
     * Verified Endpoint: /api/boards/getFilterBoard
     */
    async listTasks(params, ctx) {
        const query = new URLSearchParams({
            boardId: params.boardId,
            workspaceId: ctx.workspaceId
            // Note: 'getFilterBoard' in capture also returned users/emails, but we focus on data
        });

        const result = await this._request(`/api/boards/getFilterBoard?${query.toString()}`, "GET", null, ctx);

        if (result.success && Array.isArray(result.data)) {
            // Filter to only include items that look like tasks (just in case)
            return result.data
                .filter(item => item.type === 'Task') // capture showed "type": "Task"
                .map(t => ({
                    id: t._id,
                    name: t.name,
                    status: t.status,
                    priority: t.priority,
                    assignee: t.assigneePrimary ? { name: t.assigneePrimary.name, email: t.assigneePrimary.email } : null,
                    dueDate: t.dueDate,
                    taskNumber: t.taskNumber
                }));
        }
        return [];
    }

    /**
     * Create a new task
     * Endpoint inferred: POST /api/tasks/createTask (as standard convention)
     */
    async createTask(params, ctx) {
        const payload = {
            boardId: params.boardId,
            name: params.name,
            description: params.description || "",
            status: params.status || "To Do",
            priority: params.priority || "Medium",
            workspaceId: ctx.workspaceId,
            createdBy: ctx.email,
            subdomain: ctx.subdomain,
            accountId: ctx.accountId,
            assignee: params.assigneeEmail ? { email: params.assigneeEmail } : null,
            dueDate: params.dueDate
        };

        const result = await this._request("/api/tasks/createTask", "POST", payload, ctx);
        return {
            id: result.data?._id,
            message: "Task created successfully",
            taskNumber: result.data?.taskNumber
        };
    }

    /**
     * Update an existing task
     * Endpoint inferred: PUT /api/tasks/updateTask
     */
    async updateTask(params, ctx) {
        const payload = {
            taskId: params.taskId,
            boardId: params.boardId,
            name: params.name,
            description: params.description,
            status: params.status,
            priority: params.priority,
            dueDate: params.dueDate,
            workspaceId: ctx.workspaceId,
            updatedBy: ctx.email,
            assignee: params.assigneeEmail ? { email: params.assigneeEmail } : undefined
        };

        // Remove undefined keys to avoid sending nulls for unchanged fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        await this._request("/api/tasks/updateTask", "PUT", payload, ctx);
        return { message: "Task updated successfully", taskId: params.taskId };
    }
}

export const taskService = new TaskService();
