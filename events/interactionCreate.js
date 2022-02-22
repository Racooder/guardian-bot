/**
 * The interaction event
 */
module.exports = {
    /**
     * The name of the event
     */
	name: 'interactionCreate',
    /**
     * Handles the given interaction
     * @param {Object} interaction - The interaction object
     * @param {Object} client - The discord client
     * @returns 
     */
	async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName); // Get the corresponding command for the command interaction

        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};