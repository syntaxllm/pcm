
import "dotenv/config";
import { boardService } from "./src/boards/boards.service.js";
import { taskService } from "./src/tasks/tasks.service.js";

const mockCtx = {
    accessToken: process.env.DEV_ACCESS_TOKEN || "dummy",
    workspaceId: process.env.DEV_WORKSPACE_ID,
    subdomain: process.env.DEV_SUBDOMAIN,
    email: process.env.DEV_EMAIL,
    isCookie: false,
    accountId: process.env.DEV_ACCOUNT_ID // Ensure this is available if needed, though usually inferred
};

async function verifyTools() {
    console.log("=== STARTING COMPREHENSIVE TOOL VERIFICATION ===");
    const randomId = Math.floor(Math.random() * 10000);
    const boardName = `MCP_Verify_${randomId}`;
    let boardId = null;

    try {
        // 1. Get Assignees
        console.log("\n1. Testing 'get_assignees'...");
        const assigneesRes = await boardService.getAssignees(mockCtx);
        const assignees = JSON.parse(assigneesRes.content[0].text);
        console.log(`   ✅ Success! Found ${assignees.length} assignees.`);

        // 2. Create Board
        console.log(`\n2. Testing 'create_board' (Name: ${boardName})...`);
        const createRes = await boardService.createBoard({
            boardName,
            description: "Temporary board for MCP tool verification",
            visibility: "Private"
        }, mockCtx);
        const createData = JSON.parse(createRes.content[0].text);
        boardId = createData.id;
        console.log(`   ✅ Success! Created Board ID: ${boardId}`);

        if (!boardId) throw new Error("Failed to get Board ID from create response");

        // 3. Get Board Details
        console.log(`\n3. Testing 'get_board' (ID: ${boardId})...`);
        const getBoardRes = await boardService.getBoard({ boardId }, mockCtx);
        const boardDetails = JSON.parse(getBoardRes.content[0].text);
        if (boardDetails.name === boardName) {
            console.log(`   ✅ Success! Verified board name matches.`);
        } else {
            console.error(`   ❌ Mismatch! Expected ${boardName}, got ${boardDetails.name}`);
        }

        // 4. Update Board
        console.log("\n4. Testing 'update_board'...");
        await boardService.updateBoard({
            boardId,
            description: "Updated Description by MCP"
        }, mockCtx);
        console.log("   ✅ Success! Board updated.");

        // 5. Create Task
        console.log("\n5. Testing 'create_task'...");
        const taskName = "Verify Task 1";
        const createTaskRes = await taskService.createTask({
            boardId,
            name: taskName,
            status: "To Do",
            priority: "High"
        }, mockCtx);
        const taskData = JSON.parse(createTaskRes.content[0].text);
        const taskId = taskData.id;
        console.log(`   ✅ Success! Created Task ID: ${taskId}`);

        // 6. Update Task
        console.log("\n6. Testing 'update_task'...");
        await taskService.updateTask({
            taskId,
            boardId,
            status: "In Progress"
        }, mockCtx);
        console.log("   ✅ Success! Task updated to 'In Progress'.");

        // 7. List Tasks (Verify Update)
        console.log("\n7. Testing 'list_tasks' (Verification)...");
        const listRes = await taskService.listTasks({ boardId }, mockCtx);
        // Using relaxed parsing from previous step logic (assumed fixed in service now)
        const tasks = JSON.parse(listRes.content[0].text);
        const myTask = tasks.find(t => t.id === taskId);
        if (myTask && myTask.status === "In Progress") {
            console.log("   ✅ Success! Task found with correct status.");
        } else {
            console.error("   ❌ Task verification failed. Task not found or status mismatch.");
            console.log("   found tasks:", tasks);
        }

        // 8. Delete Board (Cleanup)
        console.log("\n8. Testing 'delete_board' (Cleanup)...");
        await boardService.deleteBoard({ boardId }, mockCtx);
        console.log("   ✅ Success! Board deleted.");

    } catch (e) {
        console.error("\n❌ VERIFICATION FAILED:", e);
    } finally {
        console.log("\n=== VERIFICATION COMPLETE ===");
    }
}

verifyTools();
