import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { APIActionRowComponent, APIMessageActionRowComponent, ApplicationCommandType, ButtonStyle } from "discord.js";
import { Command, SlashCommandResponse } from "../Interactions";
import { debug } from "../Log";
import embedColors from "../../data/embed-colors.json";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json"

const KOFI_URL = "https://ko-fi.com/racooder";
const THUMBNAIL_URL = "https://storage.ko-fi.com/cdn/brandasset/kofi_s_logo_nolabel.png?_gl=1*1vvq19e*_ga*NjQ5OTU3ODE0LjE2OTAyMDY1NjY.*_ga_M13FZ7VQ2C*MTY5MTQyNDc2Mi45LjEuMTY5MTQyNjA4NC41Ni4wLjA.";

export const Kofi: Command = {
    name: "kofi",
    description: "Support me on Ko-fi!",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        debug("Kofi command called");

        const embed = new EmbedBuilder()
            .setTitle("Support me on Ko-fi!")
            .setDescription("Consider supporting me on Ko-fi!\nIt helps me out a lot!")
            .setURL(KOFI_URL)
            .setColor(embedColors.kofi_embed)
            .setThumbnail(THUMBNAIL_URL);

        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("My Ko-fi page")
            .setURL(KOFI_URL);

        const actionRow = new ActionRowBuilder()
            .addComponents(button);

        const actionRowComponent = actionRow.toJSON() as APIActionRowComponent<APIMessageActionRowComponent>;

        // TODO: Update statistics

        const response: SlashCommandResponse = {
            initial: true,
            embeds: [embed],
            components: [actionRowComponent],
        };
        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.command.kofi,
            user: undefined, // TODO: User
        };
        return { response, statistic };
    },
};
