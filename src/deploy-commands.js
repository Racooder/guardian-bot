const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const log = require('./log.js');
require('dotenv').config();

/**
 * Holds functions for deploying commands
 */
module.exports = {
    /**
     * Deploys all guild-only commands in the given guilds
     * @param {String[]} guilds - A list of guilds
     */
	deployGuild(guilds) {
		const commands = [];
		const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

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
				log.log('Started refreshing application (/) commands.');

                for (const guild of guilds) {
                    await rest.put(
                        Routes.applicationGuildCommands(process.env.CLIENT_ID, guild),
                        { body: commands },
                    );
                }

				log.success('Successfully reloaded application (/) commands.');
			} catch (error) {
				log.error(error);
			}
		})();
	},
    /**
     * Deploys all not guild-only commands as application commands
     */
    deployGlobal() {
		const commands = [];
		const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

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
				log.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands },
                );

				log.success('Successfully reloaded application (/) commands.');
			} catch (error) {
				log.error(error);
			}
		})();
	},
    /**
     * Removes all guild commands from the given guilds
     * @param {String[]} guilds - A list of guilds
     */
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
    /**
     * Removes all application commands
     */
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
    },
    /**
     * Updates all guild-only commands in the given guilds
     * @param {String[]} guilds - A list of guilds
     */
    updateGuild(guilds) {
        const commands = [];
		const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);

            if (!command.guildOnly) {
                continue;
            }

			commands.push(command.data.toJSON());
		}

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        for (const guild of guilds) {
            rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, guild))
                .then(data => {
                    const promises = [];
                    for (const command of data) {
                        let remove = true;
                        for (const c of commands) {
                            if (command.name == c.name) {
                                remove = false;
                                break;
                            }
                        }
                        if (remove) {
                            const deleteUrl = `${Routes.applicationGuildCommands(process.env.CLIENT_ID, guild)}/${command.id}`;
                            promises.push(rest.delete(deleteUrl));
                        }
                    }
                    return Promise.all(promises);
                });
        }

        (async () => {
			try {
				log.log('Started refreshing application (/) commands.');

                for (const guild of guilds) {
                    await rest.put(
                        Routes.applicationGuildCommands(process.env.CLIENT_ID, guild),
                        { body: commands },
                    );
                }

				log.success('Successfully reloaded application (/) commands.');
			} catch (error) {
				log.error(error);

			}
		})();
    },
    /**
     * Updates all not guild-only commands as application commands
     */
    updateGlobal() {
        const commands = [];
		const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);

            if (command.guildOnly) {
                continue;
            }

			commands.push(command.data.toJSON());
		}

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
            .then(data => {
                const promises = [];
                for (const command of data) {
                    let remove = true;
                    for (const c of commands) {
                        if (command.name == c.name) {
                            remove = false;
                            break;
                        }
                    }
                    if (remove) {
                        const deleteUrl = `${Routes.applicationCommands(process.env.CLIENT_ID)}/${command.id}`;
                        promises.push(rest.delete(deleteUrl));
                    }
                }
                return Promise.all(promises);
            });

        (async () => {
            try {
                log.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands },
                );

                log.success('Successfully reloaded application (/) commands.');
            } catch (error) {
                log.error(error);
            }
        })();
    }
};
