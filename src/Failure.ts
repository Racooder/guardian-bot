import { EmbedBuilder } from "discord.js";
import { localize } from "./Localization";
import { ComponentResponse, SlashCommandResponse } from "./Interactions";
import { RawStatistic } from "./models/statistic";
import statisticKeys from "../data/statistic-keys.json"

const EMBED_COLOR = 0xaa0000;

export class Failure {
    type: string;
    localizationKey: string;
    statisticKey: string;

    constructor() {
        this.type = "Failure";
        this.localizationKey = "error.general";
        this.statisticKey = statisticKeys.failure.general;
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

    slashCommandResponse(language: string, initial: boolean): {response: SlashCommandResponse, statistic: RawStatistic} {
        const resonse: SlashCommandResponse = {
            initial: initial,
            ephemeral: true,
            content: "",
            embeds: [this.discordEmbed(language)],
            components: [],
        };
        const statistic: RawStatistic = {
            global: true,
            key: this.statisticKey,
        };
        return {
            response: resonse,
            statistic: statistic,
        };
    }

    componentResponse(language: string): ComponentResponse {
        return {
            update: false,
            ephemeral: true,
            content: "",
            embeds: [this.discordEmbed(language)],
            components: [],
        };
    }

    toString(): string {
        return `${this.type}: ${this.localizedString("en-us")}`;
    }
}

export class CommandNotFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "CommandNotFound";
        this.localizationKey = "error.command_not_found"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.commandNotFound;
    }
}

export class ComponentNotFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "ComponentNotFound";
        this.localizationKey = "error.component_not_found"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.componentNotFound;
    }
}

export class UnknownComponentTypeFailure extends Failure {
    constructor() {
        super();
        this.type = "UnknownComponentType";
        this.localizationKey = "error.unknown_component_type"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.unknownComponentType;
    }
}

export class FeatureNotImplementedFailure extends Failure {
    constructor() {
        super();
        this.type = "FeatureNotImplemented";
        this.localizationKey = "error.feature_not_implemented"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.featureNotImplemented;
    }
}

export class InvalidDateFormatFailure extends Failure {
    constructor() {
        super();
        this.type = "InvalidDateFormat";
        this.localizationKey = "error.invalid_date_format"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.invalidDateFormat;
    }
}

export class NoQuotesFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "NoQuotesFound";
        this.localizationKey = "error.no_quotes_found"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.noQuotesFound;
    }
}

export class GuildHasNoQuotesFailure extends Failure {
    constructor() {
        super();
        this.type = "GuildHasNoQuotes";
        this.localizationKey = "error.guild_has_no_quotes"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.guildHasNoQuotes;
    }
}

export class GameCreationFailure extends Failure {
    constructor() {
        super();
        this.type = "FailedCreatingGame";
        this.localizationKey = "error.failed_creating_game"; // TODO: Add english localization
        this.statisticKey = statisticKeys.failure.gameCreation;
    }
}
