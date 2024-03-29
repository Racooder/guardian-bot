import {
    ChatInputCommandInteraction,
    GuildMember,
    Interaction,
    InteractionReplyOptions,
    User,
} from "discord.js";
import { IQuoteGuesser } from "./models/quoteGuesserSchema";
import guildSchema, { GuildSettings } from "./models/guildSchema";
import { generalError } from "./InteractionReplies";
import { debug, error } from "./Log";
import { StatisticType, updateStatistic } from "./models/statisticsSchema";

/**
 * Checks for `guildId` and `member` properties
 * @param interaction - The interaction to check
 * @returns Whether or not the interaction is a guild command
 */
export function isGuildCommand(interaction: Interaction): boolean {
    return (
        interaction.guildId !== null &&
        interaction.member !== null &&
        interaction.member instanceof GuildMember
    );
}

/**
 * Splits array into chunks of size `chunkSize`
 * @param array - The array to split
 * @param chunkSize - The size of each chunk
 * @returns The array split into chunks
 */
export function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Gets the base user of a user or guild member
 * @param user - The user to get the base user of
 * @returns The user object
 */
export function getBaseUser(user: User | GuildMember): User {
    return user instanceof GuildMember ? user.user : user;
}

/**
 * Returns the display name or username of a user
 * @param user - The user to get the name of
 * @returns The name string
 */
export function usernameString(user: User | GuildMember): string {
    if (user instanceof GuildMember) {
        return user.displayName;
    } else {
        return user.username;
    }
};

/**
 * Checks if two numbers are approximately equal
 * @param a - The first number
 * @param b - The second number
 * @param epsilon - The maximum difference between the two numbers
 * @returns If the two numbers are approximately equal
 */
export function approximateEqual(
    a: number,
    b: number,
    epsilon: number
): boolean {
    return Math.abs(a - b) < epsilon;
};

/**
 * Clears all documents in a model that are older than the lifetime
 * @param model - The model to clear
 * @param lifetime - The lifetime of the documents in milliseconds
 */
export async function clearOld(
    model: any,
    lifetime: number
): Promise<void> {
    const now = new Date();
    const old = new Date(now.getTime() - lifetime);

    // Get all documents
    const documents = await model.find({});

    // Get all quote guesser games that are older than the lifetime
    const oldDocuments = documents.filter((document: IQuoteGuesser) => {
        return document.updatedAt < old;
    });

    // Delete all quote guesser games that are older than the lifetime
    for (const oldGuesserDocument of oldDocuments) {
        await oldGuesserDocument.deleteOne();
    }
};

/**
 * Gets a random element from an array
 * @param array - The array to get a random element from
 * @returns The random element
 */
export function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Parses a date string in ISO 8601 format
 * @param dateString - The date string to parse
 * @returns The parsed date or undefined if the date string is invalid
 */
export function parseDate(
    dateString: string | null
): Date | undefined {
    if (dateString !== null) {
        if (new RegExp(/^\d{4}-\d\d?-\d\d?$/).test(dateString)) {
            return new Date(dateString);
        } else {
            return undefined;
        }
    }
};

/**
 * Possible results of the changeSetting function
 */
export const enum ChangeSettingResult {
    Changed_Number,
    Missing_Number,
    Invalid_Setting,
}

/**
 * Changes a setting for a guild
 * @param guildId - The ID of the guild to change the setting for
 * @param setting - The setting to change
 * @param numberValue - The new value of the setting
 * @returns The result of the change
 */
export async function changeSetting (
    guildId: string,
    setting: string,
    numberValue: number | null
): Promise<ChangeSettingResult> {
    // Get the guild settings
    const settings = await guildSchema.getGuildSettings(guildId);

    // Find the setting
    let s: keyof GuildSettings;
    for (s in settings) {
        if (s == setting) {
            // Setting found
            // Handle different types of settings
            if (typeof settings[s]!.value === "number") {
                // Check if a valid new value was provided
                if (numberValue === null) {
                    return ChangeSettingResult.Missing_Number;
                } else {
                    // Update the setting
                    settings[s]!.value = numberValue;
                    await guildSchema.updateGuildSettings(guildId, settings);
                    return ChangeSettingResult.Changed_Number;
                }
            }
        }
    }
    return ChangeSettingResult.Invalid_Setting;
};

export type SubcommandHandlerData = {
    key: string;
    run: (
        interaction: ChatInputCommandInteraction,
        args?: any
    ) => Promise<InteractionReplyOptions>;
    stats: StatisticType[];
    args?: any;
};

export async function handleSubcommands (
    interaction: ChatInputCommandInteraction,
    key: string,
    subcommands: SubcommandHandlerData[],
    commandStats: StatisticType[],
    args?: any
): Promise<boolean> {
    debug(`Handling subcommand ${key}`);

    for (const subcommand of subcommands) {
        if (subcommand.key == key) {
            interaction.reply(
                await subcommand.run(interaction, subcommand.args || args)
            );
            let stats = commandStats.concat(subcommand.stats);
            updateStatistic(stats);
            return true;
        }
    }

    error(`Subcommand ${key} not found`, interaction.client);
    interaction.reply(generalError);
    return false;
};
