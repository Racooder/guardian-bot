import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import { debug, info, success } from "./Log";
import config from "../config.json";

export async function setupRestApi(): Promise<Server> {
    info("Starting REST API...");

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    setupValidation(app);
    setupRoutes(app);
    setupErrorHandling(app);

    app.listen(config.api_port, () => {
        success(`REST API listening on port ${config.api_port}`)
    });

    return new Server();
}

function setupValidation(app: Express) {
    debug("Setting up validation...");

    app.use('/api', function (req: Request, res: Response, next: NextFunction) {
        debug("Validating request...");

        const token = req.query['token'];

        if (!token) {
            return res.status(401).send({
                auth: false,
                message: 'No access token provided.'
            });
        }
        if (typeof token !== 'string') {
            return res.status(401).send({
                auth: false,
                message: 'Invalid access token provided.'
            });
        }

        req.token = token;
        next();
    });
}

function setupRoutes(app: Express) {
    debug("Setting up API routes...");

    app.get('/api/feedback', function (req: Request, res: Response) {
        const status = req.query['status'];
        const from = req.query['from'];
        const to = req.query['to'];

        // TODO: Check if the user is allowed to access this data.

        // TODO: Get feedback from the database.

        // TODO: Return the feedback.

        res.status(501).send({ error: "Not implemented" });
    });

    app.get('/api/feedback/:id', function (req: Request, res: Response) {
        // TODO: Check if the user is allowed to access this data.

        // TODO: Get feedback from the database.

        // TODO: Return the feedback.

        res.status(501).send({ error: "Not implemented" });
    });

    app.post('/api/feedback', function (req: Request, res: Response) {
        // TODO: Check if the user is allowed to access this data.

        // TODO: Check if the request body is valid.

        // TODO: Save the feedback to the database.

        res.status(501).send({ error: "Not implemented" });
    });

    app.get('/api/statistics', function (req: Request, res: Response) {
        const from = req.query['from'];
        const to = req.query['to'];

        // TODO: Check if the user is allowed to access this data.

        // TODO: Get general statistics from the database.

        // TODO: Return the statistics.

        res.status(501).send({ error: "Not implemented" });
    });

    app.get('/api/statistics/:user', function (req: Request, res: Response) {
        const from = req.query['from'];
        const to = req.query['to'];

        // TODO: Check if the user is allowed to access this data.

        // TODO: Get user statistics from the database.

        // TODO: Return the statistics.

        res.status(501).send({ error: "Not implemented" });
    });
}

function setupErrorHandling(app: Express) {
    debug("Setting up error handling...");

    app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
        res.status(err.status || 500);
        res.send({ error: err.message });
    });

    app.use(function (req: Request, res: Response) {
        res.status(404);
        res.send({ error: "Not found" });
    });
}
