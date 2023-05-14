import { GuildMember, Interaction, User } from "discord.js";

export const isGuildCommand = (interaction: Interaction): boolean => {
    return interaction.guildId !== null && interaction.member !== null && interaction.member instanceof GuildMember;
}

export const splitArrayIntoChunks = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export const usernameString = (user: User | GuildMember): string => {
    let baseUser = user instanceof GuildMember ? user.user : user;
    let displayName = user instanceof GuildMember ? user.displayName : undefined;
    
    if (displayName === undefined) {
        return baseUser.username;
    } else {
        return displayName;
    }
}

export const approximateEqual = (a: number, b: number, epsilon: number): boolean => {
    return Math.abs(a - b) < epsilon;
}
