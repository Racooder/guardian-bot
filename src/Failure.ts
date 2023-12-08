import { EmbedBuilder } from "discord.js";
import { localize } from "./Localization";

const EMBED_COLOR = 0xaa0000;

export class Failure {
    type: string;
    localizationKey: string;

    constructor() {
        this.type = "Failure";
        this.localizationKey = "error.general";
    }

    localizedString(language: string): string {
        return localize(this.localizationKey, language);
    }

    discordEmbed(language: string) {
        return new EmbedBuilder()
            .setTitle("Failure")
            .setDescription(this.localizedString(language))
            .setColor(EMBED_COLOR);
    }

    toString() {
        return `${this.type}: ${this.localizedString("en-us")}`;
    }
}

export class FeatureNotImplementedFailure extends Failure {
    constructor() {
        super();
        this.type = "FeatureNotImplemented";
        this.localizationKey = "error.feature_not_implemented";
    }
}

export class InvalidDateFormatFailure extends Failure {
    constructor() {
        super();
        this.type = "InvalidDateFormat";
        this.localizationKey = "error.invalid_date_format";
    }
}

export class NoQuotesFoundFailure extends Failure {
    constructor() {
        super();
        this.type = "NoQuotesFound";
        this.localizationKey = "error.no_quotes_found";
    }
}

export class GuildHasNoQuotesFailure extends Failure {
    constructor() {
        super();
        this.type = "GuildHasNoQuotes";
        this.localizationKey = "error.guild_has_no_quotes";
    }
}

export class FailedCreatingGameFailure extends Failure {
    constructor() {
        super();
        this.type = "FailedCreatingGame";
        this.localizationKey = "error.failed_creating_game";
    }
}
