import fs from "fs";
import path from "path";
import promptSync from "prompt-sync";
import { fileURLToPath } from 'url';

const prompt = promptSync({ sigint: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "../../.env");

/**
 * Manual Auth Setup (No-Login Mode)
 * Request by user: Bypass login, configure headers manually.
 */
function setupManualAuth() {
    console.log("=== Skarya MCP Config (Manual/No-Auth) ===");
    console.log("This will configure the server to bypass auth checks and send raw headers.");
    console.log("NOTE: Access Token is optional if backend allows it, but we set a dummy one.");

    // Read existing .env for defaults
    let envContent = "";
    const defaults = {
        subdomain: "",
        email: "",
        workspaceId: ""
    };

    if (fs.existsSync(ENV_PATH)) {
        envContent = fs.readFileSync(ENV_PATH, "utf-8");

        const parseEnv = (key) => {
            const match = envContent.match(new RegExp(`^${key}=(.*)`, "m"));
            return match ? match[1].trim() : "";
        };

        defaults.subdomain = parseEnv("DEV_SUBDOMAIN");
        defaults.email = parseEnv("DEV_EMAIL");
        defaults.workspaceId = parseEnv("DEV_WORKSPACE_ID");
    }

    const ask = (label, key) => {
        const def = defaults[key];
        const promptText = def ? `${label} (default: ${def}): ` : `${label}: `;
        const ans = prompt(promptText);
        return ans.trim() || def;
    };

    const subdomain = ask("Enter Subdomain", "subdomain");
    const email = ask("Enter Email", "email");
    const workspaceId = ask("Enter Workspace ID", "workspaceId");

    if (!email || !subdomain || !workspaceId) {
        console.error("All fields are required.");
        process.exit(1);
    }

    const updateEnvKey = (key, value) => {
        const regex = new RegExp(`^${key}=.*`, "m");
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
            envContent += `\n${key}=${value}`;
        }
    };

    // Update with values
    updateEnvKey("SKARYA_API_URL", `https://${subdomain}.karyaa.ai`);
    updateEnvKey("DEV_ACCESS_TOKEN", "dummy-token-bypass"); // Dummy token
    updateEnvKey("DEV_WORKSPACE_ID", workspaceId);
    updateEnvKey("DEV_SUBDOMAIN", subdomain);
    updateEnvKey("DEV_EMAIL", email);
    updateEnvKey("NODE_ENV", "development");
    updateEnvKey("DEV_NO_AUTH", "true"); // Flag for middleware

    fs.writeFileSync(ENV_PATH, envContent);
    console.log(`\nSuccess! .env file updated at ${ENV_PATH}`);
    console.log("You can now run 'npm start'. The server will use these headers for all requests.");
}

setupManualAuth();
