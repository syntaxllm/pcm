
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

        console.log(`### Found ${boards.length} Boards`);

        for (const board of boards) {
            console.log(`\n#### Board: ${board.name} (ID: ${board.id})`);

            // 2. List Tasks for each board
            const tasksRes = await taskService.listTasks({ boardId: board.id }, mockCtx);
            // Catch error if parsing fails
            let tasks = [];
            try {
                tasks = JSON.parse(tasksRes.content[0].text);
            } catch (e) {
                console.error("Failed to parse task response:", tasksRes.content[0].text);
            }

            if (tasks.length === 0) {
                console.log("  - No tasks found.");
            } else {
                console.log(`  - Found ${tasks.length} tasks:`);
                tasks.forEach(t => {
                    console.log(`    * [${t.taskNumber || 'MISSING'}] ${t.name} (Status: ${t.status}) - Type: ${t.type || 'N/A'}`); // Note: type is not in mapped object currently unless added
                });
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
