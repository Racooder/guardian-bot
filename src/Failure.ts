import { EmbedBuilder } from "discord.js";
import { localize } from "./Localization";
import { ReplyType, Response } from "./Interactions";
import { RawStatistic } from "./models/statistic";
import statisticKeys from "../data/statistic-keys.json"

const EMBED_COLOR = 0xaa0000;

export class Failure {
    type: string;
    localizationKey: string;
    statisticKey: string;
    replyType: ReplyType;

    constructor(replyType: ReplyType = ReplyType.Reply) {
        this.type = "Failure";
        this.localizationKey = "failure.general";
        this.statisticKey = statisticKeys.failure.general;
        this.replyType = replyType;
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
            replyType: this.replyType,
            ephemeral: true,
            embeds: [this.discordEmbed(language)],
            components: [],
        };
    }

    componentResponse(language: string): Response {
        return {
            replyType: this.replyType,
            ephemeral: true,
            embeds: [this.discordEmbed(language)],
            components: [],
        };
    }

    toString(): string {
        return `${this.type}: ${this.localizedString("en")}`;
    }
}

export class CommandNotFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "CommandNotFound";
        this.localizationKey = "failure.command_not_found";
        this.statisticKey = statisticKeys.failure.commandNotFound;
    }
}

export class ComponentNotFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "ComponentNotFound";
        this.localizationKey = "failure.component_not_found";
        this.statisticKey = statisticKeys.failure.componentNotFound;
    }
}

export class UnknownComponentTypeFailure extends Failure {
    constructor() {
        super();
        this.type = "UnknownComponentType";
        this.localizationKey = "failure.unknown_component_type";
        this.statisticKey = statisticKeys.failure.unknownComponentType;
    }
}

export class FeatureNotImplementedFailure extends Failure {
    constructor() {
        super();
        this.type = "FeatureNotImplemented";
        this.localizationKey = "failure.feature_not_implemented";
        this.statisticKey = statisticKeys.failure.featureNotImplemented;
    }
}

export class BotUserNotFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "BotUserNotFound";
        this.localizationKey = "failure.bot_user_not_found";
        this.statisticKey = statisticKeys.failure.botUserNotFound;
    }
}

export class RemoveWordFailure extends Failure {
    constructor() {
        super();
        this.type = "RemoveWordFailure";
        this.localizationKey = "failure.remove_word";
        this.statisticKey = statisticKeys.failure.removeWord;
    }
}

export class IsChatInputCommandFailure extends Failure {
    constructor() {
        super();
        this.type = "IsChatInputCommandFailure";
        this.localizationKey = "failure.is_chat_input_command";
        this.statisticKey = statisticKeys.failure.isChatInputCommand;
    }
}

export class SubcommandExecutionFailure extends Failure {
    constructor() {
        super();
        this.type = "SubcommandExecutionFailure";
        this.localizationKey = "failure.subcommand_execution";
        this.statisticKey = statisticKeys.failure.subcommandExecution;
    }
}

export class UnknownQuotePageDataFailure extends Failure {
    constructor() {
        super();
        this.type = "UnknownQuotePageDateFailure";
        this.localizationKey = "failure.unknown_quote_page_data";
        this.statisticKey = statisticKeys.failure.unknownQuotePageData;
    }
}
