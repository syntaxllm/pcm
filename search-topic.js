
import "dotenv/config";
import { boardService } from "./src/boards/boards.service.js";
import { taskService } from "./src/tasks/tasks.service.js";

const mockCtx = {
    accessToken: process.env.DEV_ACCESS_TOKEN || "dummy",
    workspaceId: process.env.DEV_WORKSPACE_ID,
    subdomain: process.env.DEV_SUBDOMAIN,
    email: process.env.DEV_EMAIL,
    isCookie: false
};

async function findTopic() {
    try {
        console.log("--- Searching for tasks related to 'MCP' or 'LLM' ---");

        const boardsRes = await boardService.listBoards(mockCtx);
        const boards = JSON.parse(boardsRes.content[0].text);

        let found = false;

        for (const board of boards) {
            // Fetch raw data to access pure fields
            const query = new URLSearchParams({
                boardId: board.id,
                workspaceId: mockCtx.workspaceId
            });
            const result = await taskService._request(`/api/boards/getFilterBoard?${query.toString()}`, "GET", null, mockCtx);

            if (result.data) {
                const matches = result.data.filter(t => {
                    const search = (t.name || "") + (t.description || "");
                    return search.toLowerCase().includes("mcp") || search.toLowerCase().includes("llm");
                });

                if (matches.length > 0) {
                    matches.forEach(m => {
                        console.log(`\n!!! FOUND MATCH on '${board.name}' !!!`);
                        console.log(`- ID: ${m.taskNumber || m._id}`);
                        console.log(`- Name: ${m.name}`);
                        console.log(`- Description: ${m.description || "(No description)"}`);
                        console.log(`- Status: ${m.status}`);
                        console.log(`- Full Object keys: ${Object.keys(m).join(", ")}`);
                        found = true;
                    });
                }
            }
        }

        if (!found) {
            console.log("No tasks found matching 'mcp' or 'llm'.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

findTopic();
