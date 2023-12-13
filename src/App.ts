import { debug, error, info, setupLog, warn } from "./Log";
import config from "../config.json";
import { setupRestApi } from "./RestApi";
import { setupDiscordBot } from "./Bot";
import { Server } from "http";
import { Client, HTTPError } from "discord.js";
import schedule from 'node-schedule';
import { Octokit } from "octokit";
import { existsSync, readFileSync, writeFileSync } from "fs";
import "dotenv/config";

const GITHUB_REPO_OWNER = "Racooder";
const GITHUB_REPO_NAME = "guardian-bot";
const LATEST_GITHUB_RELEASE_FILE = "../github-latest-release.txt";

var restApi: Server;
var discordClient: Client;

const octokit = new Octokit({
    auth: process.env.API_GITHUB_TOKEN,
    userAgent: "guardian-bot",
    log: {
        debug: debug,
        info: info,
        warn: warn,
        error: error,
    },
});

async function updateAvailable(): Promise<boolean> {
    const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
    }).catch((e: HTTPError) => {
        if (e.status === 404) {
            error("GitHub API returned 404, repository not found");
        } else {
            error("GitHub API returned " + e.status);
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

async function updateCheck(): Promise<void> {
    if (!config.do_update_check) {
        info("Update checking disabled");
        return;
    }
    if (config.update_check_cron === undefined || config.update_check_cron === "") {
        error("Update checking enabled but no cron expression provided");
        return;
    }

    info("Update checking enabled (cron: " + config.update_check_cron + ")");

    setTimeout(() => {
        schedule.scheduleJob(config.update_check_cron, async () => {
            debug("Checking for updates");
            if (await updateAvailable()) {
                info("Update available, restarting");
                stopApplication();
            }
        });
    });
}

async function stopApplication(): Promise<void> {
    if (restApi === undefined || discordClient === undefined) {
        error("Application not running");
        return;
    }

    restApi.close();
    discordClient.destroy();
    process.exit(0);
}

async function ready(): Promise<void> {
    info("Application ready");
    updateCheck();
}

async function setupApp(): Promise<void> {
    await setupLog();
    if (config.debug) {
        info("Debug mode enabled");
    }

    setupRestApi().then((server) => {
        restApi = server;
    });
    setupDiscordBot().then((client) => {
        discordClient = client;
    });

    ready();
}

setupApp();
