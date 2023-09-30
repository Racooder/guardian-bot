import { Client } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import "dotenv/config";
import { debug, info, setupLog, success } from "./Log";
import express, { Express, Request, Response } from "express";
import statisticsSchema from "./models/statisticsSchema";
import feedbackSchema from "./models/feedbackSchema";

setupLog().then(() => {
    if (process.env.DEBUG === "true") {
        info("Debug mode is enabled\n");
    }

    setupAPIServer();
    setupDiscordBot();
});

const setupAPIServer = () => {
    info("Starting API Server...");

    const app: Express = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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

    app.listen(process.env.API_PORT, () => {
        success(`API Server is listening on port ${process.env.API_PORT}`);
    });
};

const setupDiscordBot = () => {
    info("Starting Discord Bot...");

    const client = new Client({
        intents: ["Guilds"],
    });

    debug("Starting event listeners...");
    ready(client);
    interactionCreate(client);

    // Login
    client.login(process.env.TOKEN);
};
