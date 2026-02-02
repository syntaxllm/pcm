import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import promptSync from "prompt-sync";
import { fileURLToPath } from 'url';

const prompt = promptSync({ sigint: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "../../.env");

const STAGING_URL = "https://karyaa.ai";

/**
 * Automate Auth Setup for Staging
 */
async function setupAuth() {
    console.log("=== Skarya MCP Auth Setup (Staging) ===");

    const subdomain = prompt("Enter your Subdomain (e.g., 'acme'): ");
    const email = prompt("Enter your Email: ");
    const password = prompt("Enter your Password: ", { echo: "*" });

    if (!email || !password || !subdomain) {
        console.error("Email, Password, and Subdomain are required.");
        process.exit(1);
    }

    try {
        console.log("\nLogging in...");

        // We will try a prioritized list of endpoints.
        // Tenant isolation often means the auth endpoint is on the subdomain.
        const endpoints = [
            `https://${subdomain}.karyaa.ai/api/auth/login`, // Subdomain Auth (Likely)
            `https://${subdomain}.karyaa.ai/api/login`,      // Subdomain Login
            `${STAGING_URL}/api/auth/login`,                 // Root Auth
            `${STAGING_URL}/api/login`                       // Root Login
        ];

        let successData = null;
        let lastError = null;

        for (const url of endpoints) {
            try {
                console.log(`\n----------------------------------------`);
                console.log(`Trying: ${url}...`);
                const payload = { email, password, subdomain };

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const rawText = await response.text();
                console.log(`Status: ${response.status} ${response.statusText}`);
                console.log(`Snippet: ${rawText.substring(0, 150).replace(/\n/g, ' ')}...`);

                // If 404, valid server but wrong endpoint -> loops to next
                if (response.status === 404 || response.status === 405) {
                    lastError = new Error(`Endpoint not found (Status ${response.status})`);
                    continue;
                }

                let data;
                try {
                    data = JSON.parse(rawText);
                } catch (e) {
                    lastError = new Error(`Server returned non-JSON response (likely HTML error page)`);
                    continue; // Move to next endpoint if standard one gives html (e.g. 404 page)
                }

                if (response.ok && data.token) {
                    successData = data;
                    console.log("-> Success!");
                    break; // Stop trying
                } else {
                    lastError = new Error(`API Error: ${data.message || data.error || JSON.stringify(data)}`);
                }
            } catch (e) {
                lastError = e;
                console.log(`   Exception: ${e.message}`);
            }
        }

        if (!successData) {
            throw new Error(`\nFATAL: All login attempts failed.\nLast Error Details: ${lastError?.message}`);
        }

        const token = successData.token;
        const workspaceId = successData.user?.workspaceId || successData.workspaceId;
        const finalSubdomain = successData.user?.subdomain || successData.subdomain || subdomain;

        if (!token || !workspaceId) {
            throw new Error("Login successful but response missing 'token' or 'workspaceId'.");
        }

        console.log("\nLogin Credentials Acquired:");
        console.log(`- Token: ${token.substring(0, 10)}...`);
        console.log(`- Workspace ID: ${workspaceId}`);

        // Read existing .env
        let envContent = "";
        if (fs.existsSync(ENV_PATH)) {
            envContent = fs.readFileSync(ENV_PATH, "utf-8");
        }

        const updateEnvKey = (key, value) => {
            const regex = new RegExp(`^${key}=.*`, "m");
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
        };

        // Update with retrieved values
        updateEnvKey("SKARYA_API_URL", `https://${finalSubdomain}.karyaa.ai`); // Use resolved subdomain URL
        updateEnvKey("DEV_ACCESS_TOKEN", token);
        updateEnvKey("DEV_WORKSPACE_ID", workspaceId);
        updateEnvKey("DEV_SUBDOMAIN", finalSubdomain);
        updateEnvKey("DEV_EMAIL", email);
        updateEnvKey("NODE_ENV", "development");

        fs.writeFileSync(ENV_PATH, envContent);
        console.log(`\nSuccess! .env file updated at ${ENV_PATH}`);
        console.log("You can now run 'npm start' to test the tools.");

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

setupAuth();
