import { Client } from "discord.js";
import { EvtReady } from "./events/ready";
import { EvtInteractionCreate } from "./events/interactionCreate";

export const Listeners: EventListener[] = [EvtReady, EvtInteractionCreate];

export interface EventListener {
    start: (client: Client) => void;
}
