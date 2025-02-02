import { APIInteractionGuildMember, GuildMember, PermissionResolvable } from "discord.js";
import botUserModel, { BotUserDoc, QuotePrivacy } from "./models/botUser";
import { debug, error, warn } from "./Log";
import { Types } from "mongoose";
import { Octokit } from "@octokit/rest";
import { getConfig } from "./Config";

export const octokit = new Octokit({
    auth: getConfig().github_token,
    userAgent: getConfig().github_repo_name,
    log: {
        debug: debug,
        info: debug,
        warn: warn,
        error: error
    }
});

export function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    if (chunkSize <= 0) throw new Error("chunkSize must be greater than 0");
    if (array.length == 0) return [];
    if (array.length == 1 || chunkSize >= array.length) return [array];

    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function approximateEqual(a: number, b: number, epsilon: number): boolean {
    return Math.abs(a - b) < epsilon;
}

export function randomElement<T>(array: T[]): T {
    if (array.length === 0) throw new Error("Cannot get a random element from an empty array");

    return array[Math.floor(Math.random() * array.length)];
}

export function parseDate(dateString?: string): Date | undefined {
    if (dateString === undefined) return undefined;
    if (!new RegExp(/^\d{4}-\d\d?-\d\d?$/).test(dateString)) return undefined;

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
}

export function unixToDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
}

export function hasPermission(member: GuildMember | APIInteractionGuildMember | null, permission: PermissionResolvable): boolean {
    if (member === null) return false;
    if (typeof member.permissions === "string") return false;
    return member.permissions.has(permission);
}

export function generateToken(): string {
    const tokenNumber = new Date().getTime() - 1672531200000;
    return tokenNumber.toString(36);
}

export type Dict<T> = { [key: string]: T };

// https://stackoverflow.com/a/2450976
export function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export async function getAccessableConnections(botUser: BotUserDoc): Promise<BotUserDoc['_id'][]> {
    const connections = [botUser._id];
    for (let user of botUser.following as BotUserDoc[] | string[]) {
        if (typeof user === 'string') {
            throw new Error("BotUser.following should be populated");
        }

        if (user.settings === undefined) {
            user = await botUserModel
                .findById(user._id)
                .populate('settings')
                .exec() as BotUserDoc;
        }

        if (user.settings.quote_privacy === QuotePrivacy.PRIVATE) continue;
        if (user.settings.quote_privacy === QuotePrivacy.TWO_WAY) {
            const following = user.following as Types.ObjectId[];
            if (!following.some((id) => id.equals(botUser._id as Types.ObjectId))) continue;
        };
        connections.push(user._id);
    }

    return connections;
}

export function onlyUnique<T>(value: T, index: number, self: T[]): boolean {
    return self.indexOf(value) === index;
}
