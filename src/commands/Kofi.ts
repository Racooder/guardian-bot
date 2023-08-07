import { CommandInteraction, Client, ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command } from "../InteractionInterfaces";
import { debug } from "../Log";
import { StatisticType, updateStatistic } from "../models/statisticsSchema";
import Colors from "../Colors";

export const Kofi: Command = {
    name: "kofi",
    description: "Support us on Ko-fi!",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Kofi command called");

        debug("Building embed");
        const messageEmbed = new EmbedBuilder()
            .setTitle("Support me on Ko-Fi")
            .setDescription("Consider supporting me on Ko-Fi at https://ko-fi.com/racooder")
            .setURL("https://ko-fi.com/racooder")
            .setColor(Colors.kofiEmbed)
            .setThumbnail("https://storage.ko-fi.com/cdn/brandasset/kofi_s_logo_nolabel.png?_gl=1*1vvq19e*_ga*NjQ5OTU3ODE0LjE2OTAyMDY1NjY.*_ga_M13FZ7VQ2C*MTY5MTQyNDc2Mi45LjEuMTY5MTQyNjA4NC41Ni4wLjA.")

        await interaction.reply({
            ephemeral: true,
            embeds: [messageEmbed]
        });

        updateStatistic([StatisticType.Command_Kofi]);
    }
}
