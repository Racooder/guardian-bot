import { InteractionReplyOptions } from "discord.js";

/**
 * A general error reply.
 */
export const generalError: InteractionReplyOptions = {
    content: "An error has occurred",
    ephemeral: true
}

/**
 * A reply for when a command is not used in a guild.
 */
export const noGuildError: InteractionReplyOptions = {
    content: "Quotes are only available on discord servers/guilds!",
    ephemeral: true
}

/**
 * A reply for when a command is not implemented yet.
 */
export const notImplementedError: InteractionReplyOptions = {
    content: "This command is not implemented yet!",
    ephemeral: true
}
