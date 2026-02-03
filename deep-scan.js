
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

async function deepScan() {
    try {
        console.log("--- Starting Deep Scan for BT0003 ---");

        // 1. Get all boards
        const boardsRes = await boardService.listBoards(mockCtx);
        const boards = JSON.parse(boardsRes.content[0].text);

        console.log(`Scanning ${boards.length} Boards...`);

        let found = false;

        for (const board of boards) {
            console.log(`\nchecking Board: ${board.name} (${board.id})`);

            // 2. Fetch raw data using internal request
            // We verify if there are any hidden query params we might be missing
            // Attempt to remove filters if possible, but API seems to be /getFilterBoard

            const query = new URLSearchParams({
                boardId: board.id,
                workspaceId: mockCtx.workspaceId
                // Potentially add status=all or similar if supported?
            });

            const result = await taskService._request(`/api/boards/getFilterBoard?${query.toString()}`, "GET", null, mockCtx);

            if (result.data) {
                const totalItems = result.data.length;
                console.log(`  > Raw items count: ${totalItems}`);

                // Search in raw data
                const match = result.data.find(t =>
                    t.taskNumber === "BT0003" ||
                    (t.name && t.name.includes("BT0003")) ||
                    t._id.includes("BT0003") // Unlikely but possible
                );

                if (match) {
                    console.log("\n!!! FOUND IT !!!");
                    console.log(JSON.stringify(match, null, 2));
                    found = true;
                } else {
                    // Log the task numbers we DID find to prove coverage
                    const numbers = result.data.map(t => t.taskNumber || "NO-ID").join(", ");
                    console.log(`  > Visible IDs: ${numbers}`);
                }
            }
        }

        if (!found) {
            console.log("\n--- CONCLUSION ---");
            console.log("BT0003 is definitely NOT returned by the current API call.");
            console.log("Possibilities:");
            console.log("1. The task is archived/deleted.");
            console.log("2. The task is in a DIFFERENT workspace (Check your browser URL).");
            console.log("3. The API requires a pagination parameter (unlikely for small counts).");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

deepScan();
