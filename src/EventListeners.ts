import { Client } from "discord.js";

export const Listeners: EventListener[] = [];

export interface EventListener {
    start: (client: Client) => void;
}
