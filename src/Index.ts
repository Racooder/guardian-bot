import schedule from "node-schedule";
import { existsSync, readFileSync, writeFileSync } from "fs";
import express, { Express } from "express";
import { Server } from "http";
import cors from "cors";
import { Client } from "discord.js";
import { debug, error, info, setupLog, success } from "./Log";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import statisticsSchema from "./models/statisticsSchema";
import feedbackSchema from "./models/feedbackSchema";
import "dotenv/config";

const COMMIT_URL = "https://api.github.com/repos/Racooder/guardian-bot/commits/main";
const COMMIT_HASH_FILE = "./commit-hash.txt";

var apiServer: Server;
var discordClient: Client;

setupLog().then(async () => {
    if (process.env.DEBUG === "true") {
        info("Debug mode is enabled\n");
    }

    setupAPIServer();
    setupDiscordBot();

    updateCheck();
});

async function updateCheck() {
    if (!process.env.UPDATE_CHECK) {
        info("Update checking is disabled");
        return
    }

    if (process.env.UPDATE_CHECK_TIME === undefined) {
        error("Update check time is not defined!");
        return;
    }

    info("Update checking is enabled (intervall: " + process.env.UPDATE_CHECK_TIME + ")");

    setTimeout(() => {
        schedule.scheduleJob(process.env.UPDATE_CHECK_TIME!, async () => {
            if (await checkForUpdate()) {
                info("Update found! Restarting...");
                debug("Stopping API Server...");
                apiServer.close();
                debug("Stopping Discord Bot...");
                discordClient.destroy();
                debug("Stopping process...");
                process.exit();
            }
            debug("No update found");
        });
    }, 1000);
}

async function checkForUpdate() {
    const response = await fetch(COMMIT_URL);
            const data = await response.json();
            const latestCommitHash = data.sha;

            let currentCommitHash = "";
            if (existsSync(COMMIT_HASH_FILE)) {
                currentCommitHash = readFileSync(COMMIT_HASH_FILE).toString();
            }

            if (currentCommitHash !== latestCommitHash) {
                writeFileSync(COMMIT_HASH_FILE, latestCommitHash);
                return true;
            }
            return false;
}

async function setupAPIServer() {
    info("Starting API Server...");

    const app: Express = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    debug("Setting up API routes...");
    app.get("/statistics", (req, res) => {
        debug("API: Getting all statistics...");
        statisticsSchema.getAll().then((statistics) => {
            return res.status(200).json(statistics);
        });
    });

    app.get("/statistics/:from", (req, res) => {
        const from = new Date(parseFloat(req.params.from) * 1000);
        debug(`API: Getting all statistics from ${from}...`);
        statisticsSchema.getAll(from).then((statistics) => {
            return res.status(200).json(statistics);
        });
    });

    app.get("/statistics/:from/:to", (req, res) => {
        const from = new Date(parseFloat(req.params.from) * 1000);
        const to = new Date(parseFloat(req.params.to) * 1000);
        debug(`API: Getting all statistics from ${from} to ${to}...`);
        statisticsSchema.getAll(from, to).then((statistics) => {
            return res.status(200).json(statistics);
        });
    });

    app.get("/feedback", (req, res) => {
        debug("API: Getting all feedback...");
        feedbackSchema.getAll().then((feedback) => {
            return res.status(200).json(feedback);
        });
    });

    app.get("/feedback/:from", (req, res) => {
        const from = new Date(parseFloat(req.params.from) * 1000);
        debug(`API: Getting all feedback from ${from}...`);
        feedbackSchema.getAll(from).then((feedback) => {
            return res.status(200).json(feedback);
        });
    });

    app.get("/feedback/:from/:to", (req, res) => {
        const from = new Date(parseFloat(req.params.from) * 1000);
        const to = new Date(parseFloat(req.params.to) * 1000);
        debug(`API: Getting all feedback from ${from} to ${to}...`);
        feedbackSchema.getAll(from, to).then((feedback) => {
            return res.status(200).json(feedback);
        });
    });

    app.post("/feedback", (req, res) => {
        debug("API: Creating feedback...");
        feedbackSchema
            .create({
                type: req.body.type,
                description: req.body.description,
                creatorName: req.body.creatorName,
            })
            .then((_) => {
                return res.status(200);
            });
    });

    apiServer = app.listen(process.env.API_PORT, () => {
        success(`API Server is listening on port ${process.env.API_PORT}`);
    });
}

async function setupDiscordBot() {
    info("Starting Discord Bot...");

    discordClient = new Client({
        intents: ["Guilds"],
    });

    debug("Starting event listeners...");
    ready(discordClient);
    interactionCreate(discordClient);

    // Login
    discordClient.login(process.env.TOKEN);
}
