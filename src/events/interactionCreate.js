const { Interaction } = require('discord.js');
const { report, reportFlags } = require('../report');

/**
 * The event when the bot recieves a interaction.
 */
module.exports = {
    /**
     * The name of the event
     */
	name: 'interactionCreate',
    /**
     * Handles the given interaction
     * @param {Interaction} interaction - The interaction object
     */
	async execute(interaction) {
        // * Command Handling
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName); // Get the corresponding command for the command interaction
    
            if (!command) return;
    
            try {
                await command.execute(interaction);
            } catch (error) {
                const client = interaction.client;
                const username = interaction.user.username;
                const avatar = interaction.user.displayAvatarURL();
                const description = `${username} tried to use a command with the id ${command.id} but an error occured!`;
                const flags = reportFlags.error;
                report(client, username, avatar, description, flags);
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
	},
};
