import { GuildMember, Interaction, User } from "discord.js";

/**
 * Checks for `guildId` and `member` properties
 * @param interaction - The interaction to check
 * @returns Whether or not the interaction is a guild command
 */
export const isGuildCommand = (interaction: Interaction): boolean => {
    return interaction.guildId !== null && interaction.member !== null && interaction.member instanceof GuildMember;
}

/**
 * Splits array into chunks of size `chunkSize`
 * @param array - The array to split
 * @param chunkSize - The size of each chunk
 * @returns The array split into chunks
 */
export const splitArrayIntoChunks = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Returns the display name or username of a user
 * @param user - The user to get the name of
 * @returns The name string
 */
export const usernameString = (user: User | GuildMember): string => {
    let baseUser = user instanceof GuildMember ? user.user : user;
    let displayName = user instanceof GuildMember ? user.displayName : undefined;
    
    if (displayName === undefined) {
        return baseUser.username;
    } else {
        return displayName;
    }
}

/**
 * Checks if two numbers are approximately equal
 * @param a - The first number
 * @param b - The second number
 * @param epsilon - The maximum difference between the two numbers
 * @returns If the two numbers are approximately equal
 */
export const approximateEqual = (a: number, b: number, epsilon: number): boolean => {
    return Math.abs(a - b) < epsilon;
}
