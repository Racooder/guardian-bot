import { debug, error, info, logToDiscord, setupLog, warn } from "./Log";
import config from "../meta/config.json";
import { setupRestApi } from "./RestApi";
import { setupDiscordBot } from "./Bot";
import { Server } from "http";
import { Client, HTTPError } from "discord.js";
import schedule from 'node-schedule';
import { Octokit } from "octokit";
import { existsSync, readFileSync, writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./meta/.env" });

const GITHUB_REPO_OWNER = "Racooder";
const GITHUB_REPO_NAME = "guardian-bot";
const LATEST_GITHUB_RELEASE_FILE = "../github-latest-release.txt";

var restApi: Server;
var discordClient: Client;

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "guardian-bot",
    log: {
        debug: debug,
        info: info,
        warn: warn,
        error: error,
    },
});

async function updateAvailable(discordClient: Client): Promise<boolean> {
    debug("Checking for updates");

    const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
    }).catch((e: HTTPError) => {
        if (e.status === 404) {
            logToDiscord(discordClient, error("GitHub API returned 404, release not found"));
        } else {
            logToDiscord(discordClient, error("GitHub API returned " + e.status));
        }
    });
    if (response === undefined || response.status === 200) {
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

    if (currentRelease === latestRelease) {
        return false;
    }
    writeFileSync(LATEST_GITHUB_RELEASE_FILE, latestRelease, { encoding: "ascii" });
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

    if (restApi === undefined || discordClient === undefined) {
        error("Application not running");
        return;
    }

    restApi.close();
    discordClient.destroy();
    process.exit(0);
}

function ready(discordClient: Client): void {
    info("Application ready");
    scheduleUpdateChecks(discordClient);
}

async function setupApp(): Promise<void> {
    await setupLog();
    if (config.debug) {
        info("Debug mode enabled");
    }

    const server = setupRestApi();
    const client = setupDiscordBot();

    restApi = await server;
    discordClient = await client;
    ready(discordClient);
}

setupApp();
