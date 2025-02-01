import { debug, error, info, logToDiscord, setupLog, success } from "./Log";
import { config, octokit } from "./Essentials";
import { setupDiscordBot } from "./Bot";
import { Server } from "http";
import { Client } from "discord.js";
import schedule from 'node-schedule';
import dotenv from "dotenv";
import { setupRestApi } from "./Rest";
import { createWriteStream, existsSync, readFileSync, writeFileSync } from "fs";
import { response } from "express";

dotenv.config({ path: "./meta/.env" });

const CURRENT_RELEASE_FILE = "./current-release.txt";
const DOWNLOAD_FILE = "./release-download.txt";

var restApi: Server;
var discordClient: Client;

async function updateAvailable(discordClient: Client): Promise<boolean> {
    debug("Checking for updates");

    const releaseResponse = await octokit.rest.repos.getLatestRelease({
        owner: config.github_repo_owner,
        repo: config.github_repo_name
    }).catch((e) => {
        if (e.status === 404) {
            logToDiscord(discordClient, error("GitHub API returned 404, release not found"));
        } else {
            logToDiscord(discordClient, error("GitHub API returned " + e.status));
        }
    });
    if (releaseResponse === undefined) return false;

    const latestRelease = releaseResponse.data.tag_name;

    let currentRelease = "";
    if (existsSync(CURRENT_RELEASE_FILE)) {
        currentRelease = readFileSync(CURRENT_RELEASE_FILE, "utf-8");
    }

    if (currentRelease === latestRelease) return false;

    writeFileSync(CURRENT_RELEASE_FILE, latestRelease, { encoding: "utf-8" });
    writeFileSync(DOWNLOAD_FILE, releaseResponse.data.assets[0].browser_download_url, { encoding: "utf-8" });

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
