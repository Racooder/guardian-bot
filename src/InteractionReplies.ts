import { InteractionReplyOptions } from "discord.js";

/**
 * A general error reply.
 */
export const generalError: InteractionReplyOptions = {
    content: "An error has occurred",
    ephemeral: true,
};

/**
 * A reply for when a command is not used in a guild.
 */
export const noGuildError: InteractionReplyOptions = {
    content: "Quotes are only available on discord servers/guilds!",
    ephemeral: true,
};

/**
 * A reply for when a command is not implemented yet.
 */
export const notImplementedError: InteractionReplyOptions = {
    content: "This command is not implemented yet!",
    ephemeral: true,
};

/**
 * A reply for when a date is not in ISO 8601 format.
 */
export const invalidDateFormatError: InteractionReplyOptions = {
    content: "Invalid date format! Please use format (YYYY-MM-DD)",
    ephemeral: true,
};

/**
 * A reply for when there are no quotes matching the search criteria.
 */
export const notMatchingSearchError: InteractionReplyOptions = {
    content:
        "There are no quotes matching your search criteria on this server!",
    ephemeral: true,
};

/**
 * A reply for when there are no quotes on the server.
 */
export const noQuotesError: InteractionReplyOptions = {
    content: "There are no quotes on this server",
    ephemeral: true,
};

/**
 * A reply for when it was not possible to create a new game.
 */
export const failedToCreateGameError: InteractionReplyOptions = {
    content: "Failed to create a new game",
    ephemeral: true,
};
