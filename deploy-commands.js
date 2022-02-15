const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
require('dotenv').config();

module.exports = {
	deployGuild(guilds) {
		const commands = [];
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);

            if (!command.guildOnly) {
                continue;
            }

			commands.push(command.data.toJSON());
		}

		const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        
		(async () => {
			try {
				console.log('Started refreshing application (/) commands.');

                for (const guild of guilds) {
                    await rest.put(
                        Routes.applicationGuildCommands(process.env.CLIENT_ID, guild),
                        { body: commands },
                    );
                }

				console.log('Successfully reloaded application (/) commands.');
			} catch (error) {
				console.error(error);
			}
		})();
	},
    deployGlobal() {
		const commands = [];
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);

            if (command.guildOnly) {
                continue;
            }

			commands.push(command.data.toJSON());
		}

		const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        
		(async () => {
			try {
				console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands },
                );

				console.log('Successfully reloaded application (/) commands.');
			} catch (error) {
				console.error(error);
			}
		})();
	},
    removeGuild(guilds) {
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        for (const guild of guilds) {
            rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, guild))
                .then(data => {
                    const promises = [];
                    for (const command of data) {
                        const deleteUrl = `${Routes.applicationGuildCommands(process.env.CLIENT_ID, guild)}/${command.id}`;
                        promises.push(rest.delete(deleteUrl));
                    }
                    return Promise.all(promises);
                });
        }
    },
    removeGlobal() {
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
            .then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationCommands(process.env.CLIENT_ID)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });
    }
};