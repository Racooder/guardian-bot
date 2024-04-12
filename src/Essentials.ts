import { APIInteractionGuildMember, GuildMember, PermissionResolvable } from "discord.js";
import { debug } from "./Log";

export function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    debug("Splitting array into chunks");

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
    debug(`Checking if ${a} is approximately equal to ${b} with epsilon ${epsilon}`);

    return Math.abs(a - b) < epsilon;
}

export function randomElement<T>(array: T[]): T {
    debug("Getting random element from array");

    if (array.length === 0) throw new Error("Cannot get a random element from an empty array");

    return array[Math.floor(Math.random() * array.length)];
}

export function parseDate(dateString?: string): Date | undefined {
    debug(`Parsing date from ${dateString}`);

    if (dateString === undefined) return undefined;
    if (!new RegExp(/^\d{4}-\d\d?-\d\d?$/).test(dateString)) return undefined;

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
}

export function unixToDate(timestamp: number): Date {
    debug(`Converting unix timestamp ${timestamp} to date`);

    return new Date(timestamp * 1000);
}

export function hasPermission(member: GuildMember | APIInteractionGuildMember | null, permission: PermissionResolvable): boolean {
    debug("Checking if member has permission")

    if (member === null) return false;
    if (typeof member.permissions === "string") return false;
    return member.permissions.has(permission);
}

export function generateToken(): string {
    debug("Generating token")

    const tokenNumber = new Date().getTime() - 1672531200000;
    return tokenNumber.toString(36);
}

export type Dict<T> = { [key: string]: T };

// https://stackoverflow.com/a/2450976
export function shuffleArray<T>(array: T[]): T[] {
    debug("Shuffling array")

    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}
