
import "dotenv/config";
import { boardService } from "./src/boards/boards.service.js";
import { taskService } from "./src/tasks/tasks.service.js";

// Mock Auth Context
const mockCtx = {
    accessToken: process.env.DEV_ACCESS_TOKEN || "dummy",
    workspaceId: process.env.DEV_WORKSPACE_ID,
    subdomain: process.env.DEV_SUBDOMAIN,
    email: process.env.DEV_EMAIL,
    isCookie: false
};

async function run() {
    try {
        const boardsRes = await boardService.listBoards(mockCtx);
        const boards = JSON.parse(boardsRes.content[0].text);

        // Find dev board
        const devBoard = boards.find(b => b.name.toLowerCase().includes("dev"));

        if (!devBoard) {
            console.log("No 'dev' board found.");
            return;
        }

        console.log(`Listing tasks for board: ${devBoard.name} (${devBoard.id})`);
        // Use internal _request to bypass filtering logic for debugging
        const query = new URLSearchParams({
            boardId: devBoard.id,
            workspaceId: mockCtx.workspaceId
        });
        // We have to bind context to _request or access via public method if _ is protected (it's not in JS modules usually, but good to be safe)
        // Accessing _request directly
        const result = await taskService._request(`/api/boards/getFilterBoard?${query.toString()}`, "GET", null, mockCtx);

        console.log("Raw API Response Success:", result.success);
        console.log("Raw Data Length:", result.data ? result.data.length : "null");

        if (result.data) {
            result.data.forEach(item => {
                console.log(`- Item Type: ${item.type}, Name: ${item.name}, ID: ${item._id}`);
                console.log(`  Full Item:`, JSON.stringify(item));
            });
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
