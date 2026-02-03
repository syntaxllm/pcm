
import "dotenv/config";
import { boardService } from "./src/boards/boards.service.js";

const mockCtx = {
    accessToken: process.env.DEV_ACCESS_TOKEN || "dummy",
    workspaceId: process.env.DEV_WORKSPACE_ID,
    subdomain: process.env.DEV_SUBDOMAIN,
    email: process.env.DEV_EMAIL,
    isCookie: false
};

async function renameBoard() {
    try {
        // 1. Find the board
        const boardsRes = await boardService.listBoards(mockCtx);
        const boards = JSON.parse(boardsRes.content[0].text);

        // Look for 'New' or 'Modules'
        const targetBoard = boards.find(b => b.name === "New" || b.name === "Modules");

        if (!targetBoard) {
            console.log("Board 'New' or 'Modules' not found.");
            console.log("Available boards:", boards.map(b => b.name).join(", "));
            return;
        }

        console.log(`Found target board: ${targetBoard.name} (ID: ${targetBoard.id})`);

        // 2. Update the board name
        const updateRes = await boardService.updateBoard({
            boardId: targetBoard.id,
            boardName: "Competition",
            visibility: targetBoard.visibility, // Maintain existing
            description: targetBoard.description || "" // Maintain existing
        }, mockCtx);

        console.log("Update Response:", updateRes.content[0].text);

    } catch (e) {
        console.error("Error:", e);
    }
}

renameBoard();
