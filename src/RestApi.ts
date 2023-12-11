import { Server } from "http";
import { info } from "./Log";

export async function setupRestApi(): Promise<Server> {
    info("Starting REST API...");

    // TODO: Implement REST API

    return new Server();
}
