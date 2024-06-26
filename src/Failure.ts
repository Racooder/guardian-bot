import { Client, EmbedBuilder } from "discord.js";
import { localize } from "./Localization";
import { ReplyType, Response } from "./Interactions";
import { RawStatistic } from "./models/statistic";
import statisticKeys from "../data/statistic-keys.json"
import { error, logToDiscord } from "./Log";

const EMBED_COLOR = 0xaa0000;

export class Failure {
    type: string;
    localizationKey: string;
    statisticKey: string;
    error?: Error;

    constructor(error?: Error) {
        this.type = "Failure";
        this.localizationKey = "failure.general";
        this.statisticKey = statisticKeys.failure.general;
        this.error = error;
    }

    localizedString(language: string): string {
        return localize(this.localizationKey, language);
    }

    discordEmbed(language: string): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle("Failure")
            .setDescription(this.localizedString(language))
            .setColor(EMBED_COLOR);
    }

    statistic(): RawStatistic {
        return {
            global: true,
            key: this.statisticKey,
        };
    }

    slashCommandResponse(language: string, initial: boolean): Response {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            embeds: [this.discordEmbed(language)],
            components: [],
        };
    }

    componentResponse(language: string): Response {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            embeds: [this.discordEmbed(language)],
            components: [],
        };
    }

    toString(): string {
        return `${this.type}: ${this.localizedString("en")}`;
    }

    log(client?: Client): void {
        const embed = error(`${this.type}: ${this.localizedString("en")}`, this.error);
        if (client) {
            logToDiscord(client, embed);
        }
    }
}

export class CommandNotFoundFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "CommandNotFound";
        this.localizationKey = "failure.command_not_found";
        this.statisticKey = statisticKeys.failure.commandNotFound;
    }
}

export class ComponentNotFoundFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "ComponentNotFound";
        this.localizationKey = "failure.component_not_found";
        this.statisticKey = statisticKeys.failure.componentNotFound;
    }
}

export class SubcommandGroupNotFoundFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "SubcommandGroupNotFound";
        this.localizationKey = "failure.subcommand_group_not_found";
        this.statisticKey = statisticKeys.failure.subcommandGroupNotFound;
    }
}

export class SubcommandNotFoundFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "SubcommandNotFound";
        this.localizationKey = "failure.subcommand_not_found";
        this.statisticKey = statisticKeys.failure.subcommandNotFound;
    }
}

export class UnknownComponentTypeFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "UnknownComponentType";
        this.localizationKey = "failure.unknown_component_type";
        this.statisticKey = statisticKeys.failure.unknownComponentType;
    }
}

export class FeatureNotImplementedFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "FeatureNotImplemented";
        this.localizationKey = "failure.feature_not_implemented";
        this.statisticKey = statisticKeys.failure.featureNotImplemented;
    }
}

export class BotUserNotFoundFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "BotUserNotFound";
        this.localizationKey = "failure.bot_user_not_found";
        this.statisticKey = statisticKeys.failure.botUserNotFound;
    }
}

export class RemoveWordFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "RemoveWordFailure";
        this.localizationKey = "failure.remove_word";
        this.statisticKey = statisticKeys.failure.removeWord;
    }
}

export class IsChatInputCommandFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "IsChatInputCommandFailure";
        this.localizationKey = "failure.is_chat_input_command";
        this.statisticKey = statisticKeys.failure.isChatInputCommand;
    }
}

export class SubcommandExecutionFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "SubcommandExecutionFailure";
        this.localizationKey = "failure.subcommand_execution";
        this.statisticKey = statisticKeys.failure.subcommandExecution;
    }
}

export class UnknownQuotePageDataFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "UnknownQuotePageDateFailure";
        this.localizationKey = "failure.unknown_quote_page_data";
        this.statisticKey = statisticKeys.failure.unknownQuotePageData;
    }
}

export class SlashCommandExecutionFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "SlashCommandExecutionFailure";
        this.localizationKey = "failure.slash_command_execution";
        this.statisticKey = statisticKeys.failure.slashCommandExecution;
    }
}

export class MessageComponentExecutionFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "MessageComponentExecutionFailure";
        this.localizationKey = "failure.message_component_execution";
        this.statisticKey = statisticKeys.failure.messageComponentExecution;
    }
}

export class UnknownFollowMenuDataFailure extends Failure {
    constructor(error?: any) {
        super(error);
        this.type = "UnknownFollowMenuDataFailure";
        this.localizationKey = "failure.unknown_follow_menu_data";
        this.statisticKey = statisticKeys.failure.unknownFollowMenuData;
    }
}
