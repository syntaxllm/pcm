import "dotenv/config";
import { boardService } from "./src/boards/boards.service.js";
import { taskService } from "./src/tasks/tasks.service.js";

const ctx = {
    accessToken: process.env.DEV_ACCESS_TOKEN,
    workspaceId: process.env.DEV_WORKSPACE_ID,
    subdomain: process.env.DEV_SUBDOMAIN,
    email: process.env.DEV_EMAIL,
    accountId: process.env.DEV_ACCOUNT_ID
};

async function testAll() {
    console.log("Starting Full Verification Script...");

    try {
        // 1. Get Board Details
        console.log("\n[1/5] Testing getBoard...");
        const board = await boardService.getBoard({ boardId: "69817e023b45d6c8475b9d85" }, ctx);
        console.log("✅ getBoard Success");

        // 2. Get Assignees
        console.log("\n[2/5] Testing getAssignees...");
        await boardService.getAssignees(ctx);
        console.log("✅ getAssignees Success");

        // 3. List Tasks
        console.log("\n[3/5] Testing listTasks...");
        const tasks = await taskService.listTasks({ boardId: "69817e023b45d6c8475b9d85" }, ctx);
        console.log("✅ listTasks Success");

        // 4. Create Board
        console.log("\n[4/5] Testing createBoard...");
        const newBoard = await boardService.createBoard({ boardName: "Script-Test-Board" }, ctx);
        console.log("✅ createBoard Success");

        // 5. Apply Template
        console.log("\n[5/5] Testing applyTemplate...");
        await boardService.applyTemplate({ boardName: "Template-Script-Test", templateId: "kanban" }, ctx);
        console.log("✅ applyTemplate Success");

        console.log("\n🚀 ALL TOOLS VERIFIED SUCCESSFULLY VIA SCRIPT");

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

testAll();
