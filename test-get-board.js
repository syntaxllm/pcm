import { boardService } from "./src/boards/boards.service.js";
import "dotenv/config";

const ctx = {
    accessToken: process.env.DEV_ACCESS_TOKEN,
    workspaceId: process.env.DEV_WORKSPACE_ID,
    subdomain: process.env.DEV_SUBDOMAIN,
    email: process.env.DEV_EMAIL,
    accountId: process.env.DEV_ACCOUNT_ID
};

async function test() {
    console.log("Testing getBoard with ID: 69817e023b45d6c8475b9d85");
    try {
        const result = await boardService.getBoard({ boardId: "69817e023b45d6c8475b9d85" }, ctx);
        console.log("SUCCESS:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("FAIL:", err.message);
    }
}

test();
