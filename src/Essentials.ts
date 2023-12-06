import { GuildMember, Interaction } from "discord.js";

/**
 * Checks for `guildId` and `member` properties
 * @param interaction - The interaction to check
 * @returns Whether or not the interaction is a guild command
 */
export function isGuildCommand(interaction: Interaction): boolean {
    return interaction.guildId !== null && interaction.member !== null && interaction.member instanceof GuildMember;
}

/**
 * Splits array into chunks of size `chunkSize`
 * @param array - The array to split
 * @param chunkSize - The size of each chunk
 * @returns The array split into chunks
 * @throws If `chunkSize` is 0 or less
 */
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

/**
 * Checks if two numbers are approximately equal
 * @param a - The first number
 * @param b - The second number
 * @param epsilon - The maximum difference between the two numbers
 * @returns If the two numbers are approximately equal
 */
export function approximateEqual(a: number, b: number, epsilon: number): boolean {
    return Math.abs(a - b) < epsilon;
}

/**
 * Gets a random element from an array
 * @param array - The array to get a random element from
 * @returns The random element
 * @throws If the array is empty
 */
export function randomElement<T>(array: T[]): T {
    if (array.length === 0) throw new Error("Cannot get a random element from an empty array");

    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Parses a date string in ISO 8601 format
 * @param dateString - The date string to parse
 * @returns The parsed date or undefined if the date string is invalid
 */
export function parseDate(dateString: string | null): Date | undefined {
    if (dateString !== null) {
        if (new RegExp(/^\d{4}-\d\d?-\d\d?$/).test(dateString)) {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
}
