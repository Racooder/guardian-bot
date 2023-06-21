import { Client } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import 'dotenv/config';
import { debug, info, setupLog, success } from './Log';
import express, { Express, Request, Response } from "express";
import statisticsSchema from "./models/statisticsSchema";

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
    app.get('/statistics', (req, res) => {
        debug("API: Getting all statistics...");
        statisticsSchema.getAll().then((statistics) => {
            return res.json(statistics);
        });
    });

    app.get('/statistics/:from', (req, res) => {
        const from = new Date(parseFloat(req.params.from) * 1000);
        debug(`API: Getting all statistics from ${from}...`);
        statisticsSchema.getAll(from).then((statistics) => {
            return res.json(statistics);
        });
    });

    app.get('/statistics/:from/:to', (req, res) => {
        const from = new Date(parseFloat(req.params.from) * 1000);
        const to = new Date(parseFloat(req.params.to) * 1000);
        debug(`API: Getting all statistics from ${from} to ${to}...`);
        statisticsSchema.getAll(from, to).then((statistics) => {
            return res.json(statistics);
        });
    });

    app.listen(process.env.API_PORT, () => {
        success(`API Server is listening on port ${process.env.API_PORT}`);
    });
}

const setupDiscordBot = () => {
    info("Starting Discord Bot...");
    
    const client = new Client({
        intents: []
    });
    
    debug("Starting event listeners...");
    ready(client);
    interactionCreate(client);
    
    // Login
    client.login(process.env.TOKEN);
}
