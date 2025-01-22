import { debug, error, info, logToDiscord, setupLog, success } from "./Log";
import { config, octokit } from "./Essentials";
import { setupDiscordBot } from "./Bot";
import { Server } from "http";
import { Client, HTTPError } from "discord.js";
import schedule from 'node-schedule';
import { existsSync, readFileSync, writeFileSync } from "fs";
import dotenv from "dotenv";
import { setupRestApi } from "./Rest";

dotenv.config({ path: "./meta/.env" });

const LATEST_GITHUB_RELEASE_FILE = "./github-latest-release.txt";
const DOWNLOAD_URL_PATH = "./update-url.txt";

var restApi: Server;
var discordClient: Client;

async function updateAvailable(discordClient: Client): Promise<boolean> {
    debug("Checking for updates");

    const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
        owner: config.github_repo_owner,
        repo: config.github_repo_name,
    }).catch((e: HTTPError) => {
        if (e.status === 404) {
            logToDiscord(discordClient, error("GitHub API returned 404, release not found"));
        } else {
            logToDiscord(discordClient, error("GitHub API returned " + e.status));
        }
    });
    if (response === undefined || response.status !== 200) {
        return false;
    }
    const latestRelease = response.data.tag_name;

    let currentRelease: string;
    if (existsSync(LATEST_GITHUB_RELEASE_FILE)) {
        currentRelease = readFileSync(LATEST_GITHUB_RELEASE_FILE, "utf-8");
    } else {
        currentRelease = "";
        writeFileSync(LATEST_GITHUB_RELEASE_FILE, "", { encoding: "utf-8" });
    }

    const artifactUrl = response.data.assets[0].browser_download_url;

    if (currentRelease === latestRelease) {
        return false;
    }
    writeFileSync(LATEST_GITHUB_RELEASE_FILE, latestRelease, { encoding: "utf-8" });
    writeFileSync(DOWNLOAD_URL_PATH, artifactUrl, { encoding: "utf-8" });
    return true;
}

async function scheduleUpdateChecks(discordClient: Client): Promise<void> {
    debug("Scheduling update checks");

    if (!config.do_update_check) {
        info("Update checking disabled");
        return;
    }
    if (config.update_check_cron === undefined || config.update_check_cron === "") {
        logToDiscord(discordClient, error("Update checking enabled but no cron expression provided"));
        return;
    }

    info("Update checking enabled (cron: " + config.update_check_cron + ")");

    updateCheck();
    schedule.scheduleJob(config.update_check_cron, updateCheck);
}

async function updateCheck() {
    debug("Running update check");

    if (await updateAvailable(discordClient)) {
        info("Update available, restarting");
        stopApplication();
    }
}

function stopApplication(): void {
    debug("Stopping application");

    if (discordClient === undefined) {
        error("Application not running");
        return;
    }

    restApi.close();
    discordClient.destroy();
    process.exit(0);
}

function ready(discordClient: Client): void {
    success("Application ready");
    scheduleUpdateChecks(discordClient);
}

async function setupApp(): Promise<void> {
    await setupLog();
    if (config.debug) {
        info("Debug mode enabled");
    }

    restApi = setupRestApi();

    const client = setupDiscordBot();
    discordClient = await client;

    ready(discordClient);
}

setupApp();
