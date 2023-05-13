import { InteractionReplyOptions } from "discord.js";

export const generalError: InteractionReplyOptions = {
    content: "An error has occurred",
    ephemeral: true
}
export const noGuildError: InteractionReplyOptions = {
    content: "Quotes are only available on discord servers/guilds!",
    ephemeral: true
}
