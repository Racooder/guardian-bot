import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { APIActionRowComponent, APIMessageActionRowComponent, ApplicationCommandType, ButtonStyle } from "discord.js";
import { Command, ReplyType, Response } from "../Interactions";
import { debug } from "../Log";
import embedColors from "../../data/embed-colors.json";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json"

const KOFI_URL = "https://ko-fi.com/racooder";
const PAYPAL_URL = "https://paypal.me/racooder";
const THUMBNAIL_URL = "https://storage.ko-fi.com/cdn/brandasset/kofi_s_logo_nolabel.png?_gl=1*1vvq19e*_ga*NjQ5OTU3ODE0LjE2OTAyMDY1NjY.*_ga_M13FZ7VQ2C*MTY5MTQyNDc2Mi45LjEuMTY5MTQyNjA4NC41Ni4wLjA.";

export const Donate: Command = {
    name: "donate",
    description: "Support the developement of the bot!",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction, botUser) => {
        debug("Donate command called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.command.donate,
            userId: botUser.id,
        };

        const embed = new EmbedBuilder()
            .setTitle("Donate on Ko-fi or directly per PayPal!")
            .setDescription("Consider supporting the developement and hosting of the bot by donating via Ko-fi or PayPal!")
            .setColor(embedColors.donate_embed)
            .setThumbnail(THUMBNAIL_URL);

        const kofiButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Ko-fi")
            .setURL(KOFI_URL);

        const paypalButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("PayPal")
            .setURL(PAYPAL_URL);

        const actionRow = new ActionRowBuilder()
            .addComponents(kofiButton)
            .addComponents(paypalButton);

        const actionRowComponent = actionRow.toJSON() as APIActionRowComponent<APIMessageActionRowComponent>;

        const response: Response = {
            replyType: ReplyType.Reply,
            embeds: [embed],
            components: [actionRowComponent],
        };
        return { response, statistic };
    },
};
