import { ButtonInteraction, CommandInteraction, GuildMember } from "discord.js";

export const isGuildCommand = (interaction: CommandInteraction | ButtonInteraction): boolean => {
    return interaction.guildId !== null && interaction.member !== null && interaction.member instanceof GuildMember;
};

export const splitArrayIntoChunks = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
