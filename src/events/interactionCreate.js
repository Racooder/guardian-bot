const { readdirSync } = require('fs');
const { Interaction } = require('discord.js');
const { report, reportFlags } = require('../report');
const log = require('../log.js');

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
        // * Button Handling
        if (interaction.isButton()) {
            const buttonFiles = readdirSync('./src/buttons').filter(file => file.endsWith('.js'));
            let args = interaction.customId.split('_');
            const id = args.shift();
    
            for (const file of buttonFiles) {
                const button = require(`../buttons/${file}`);
                if (id == button.id) {
                    button.execute(interaction, args);
                }
            }
        }

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
                log.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
	},
};
