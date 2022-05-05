const { MessageEmbed, Interaction, MessageActionRow, MessageButton } = require('discord.js');
const { readFileChangelog } = require('../fileReader');

module.exports = {
    /**
     * The button id prefix
     */
    id: 'changelog',
    /**
     * Handles a changelog menu button
     * @param {Interaction} interaction - The interaction object
     * @param {String[]} args - The button arguments
     */
	async execute(interaction, args) {
        const instruction = args.shift();

        let message;
        
        switch (instruction) {
            case 'page': {
                const page = parseInt(args.shift()) || 1;
                const changelog = await readFileChangelog();
                if (page == 1 || !page) {
                    const embed = new MessageEmbed()
                        .setTitle(changelog[0][0])
                        .setDescription(changelog[0][1]);

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId(`changelog_page_2`)
                                .setLabel("Next Page")
                                .setStyle('PRIMARY')
                        );

                    message = { embeds: [embed], components: [row], ephemeral: true };
                } else {
                    const startIndex = (page - 1) * 3 - 2;
                    const endIndex = startIndex + 3;
                    const changelogEntries = changelog.slice(startIndex, endIndex < changelog.length ? endIndex : changelog.length);
                    const embed = new MessageEmbed()
                        .setTitle(`Changelog Page ${page}`);
                    for (let i = 0; i < changelogEntries.length; i++) {
                        embed.addField(changelogEntries[i][0], changelogEntries[i][1]);
                    }

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId(`changelog_page_${page - 1}`)
                                .setLabel("Previous Page")
                                .setStyle('PRIMARY'),
                        );

                    if (endIndex < changelog.length) {
                        row.addComponents(
                            new MessageButton()
                                .setCustomId(`changelog_page_${page + 1}`)
                                .setLabel("Next Page")
                                .setStyle('PRIMARY')
                        );
                    }

                    message = { embeds: [embed], components: [row], ephemeral: true };
                }
                break;
            }
        }

		interaction.update({ content: message.content, embeds: message.embeds, components: message.components, ephemeral: message.ephemeral });
	},
};