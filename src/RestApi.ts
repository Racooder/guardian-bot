import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import { debug, info, success } from "./Log";
import { config } from "./Essentials";
import statisticModel, { StatisticFilter, getGlobalStatistics, getStatistics, getUserStatistics } from "./models/statistic";
import statisticKeys from "../data/statistic-keys.json"
import { unixToDate } from "./Essentials";

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

        // TODO: Check if the token is valid.

        // TODO: Get token permissions.

        statisticModel.create({
            global: true,
            key: statisticKeys.api.request
        });

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

    app.get('/api/statistics', async function (req: Request, res: Response) {
        const from = req.query['from'];
        const to = req.query['to'];
        const keys = req.query['keys'];

        let filter: StatisticFilter = { };
        if (typeof from === 'string' && from.match(/^\d+$/)) {
            filter.from = unixToDate(parseInt(from));
        }
        if (typeof to === 'string' && to.match(/^\d+$/)) {
            filter.to = unixToDate(parseInt(to));
        }
        if (typeof keys === 'string') {
            filter.keys = keys.split(',');
            if (filter.keys.length === 0) {
                filter.keys = undefined;
            }
        }

        // TODO: Check if the user is allowed to access this data.

        // TODO: Filter the statistics by the key.

        const stats = await getStatistics(filter);

        // TODO: Format the statistics.

        res.status(200).send(stats);
    });

    app.get('/api/statistics/global', async function (req: Request, res: Response) {
        const from = req.query['from'];
        const to = req.query['to'];
        const keys = req.query['keys'];

        let filter: StatisticFilter = { };
        if (typeof from === 'string' && from.match(/^\d+$/)) {
            filter.from = unixToDate(parseInt(from));
        }
        if (typeof to === 'string' && to.match(/^\d+$/)) {
            filter.to = unixToDate(parseInt(to));
        }
        if (typeof keys === 'string') {
            filter.keys = keys.split(',');
            if (filter.keys.length === 0) {
                filter.keys = undefined;
            }
        }

        // TODO: Check if the user is allowed to access this data.

        // TODO: Filter the statistics by the key.

        const stats = await getGlobalStatistics(filter);

        // TODO: Format the statistics.

        res.status(200).send(stats);
    });

    app.get('/api/statistics/:user', function (req: Request, res: Response) {
        const user = req.params['user'];
        const from = req.query['from'];
        const to = req.query['to'];
        const keys = req.query['keys'];

        let filter: StatisticFilter = { };
        if (typeof from === 'string' && from.match(/^\d+$/)) {
            filter.from = unixToDate(parseInt(from));
        }
        if (typeof to === 'string' && to.match(/^\d+$/)) {
            filter.to = unixToDate(parseInt(to));
        }
        if (typeof keys === 'string') {
            filter.keys = keys.split(',');
            if (filter.keys.length === 0) {
                filter.keys = undefined;
            }
        }

        // TODO: Check if the provided user is valid. (Return not allowed to access this data if not. The user might be trying to find out if a user exists.)

        // TODO: Check if the user is allowed to access this data.

        // TODO: Filter the statistics by date and key.

        const stats = getUserStatistics(user, filter);

        // TODO: Format the statistics.

        res.status(200).send(stats);
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
