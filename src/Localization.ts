import { existsSync } from "fs";
import { Dict } from "./Essentials";
import { debug } from "./Log";

const LOCALIZATION_FOLDER = "localization";
const FALLBACK_LANGUAGE = 'en';

var localization: Dict<Dict<string>> = {};

function loadLanguage(language: string): void {
    debug(`Loading language ${language}`);

    if (localization[language]) {
        return;
    }
    if (!existsSync(`${LOCALIZATION_FOLDER}/${language}.json`)) {
        return;
    }
    localization[language] = require(`../${LOCALIZATION_FOLDER}/${language}.json`);
}

/**
 * Returns
 * @param key - The key to localize
 * @param language - ISO 639-1 standard language codes
 * @returns The text in the specified language, or the fallback language if the key is not found
 */
export function localize(key: string, language: string): string {
    debug(`Localizing key ${key} in language ${language}`);

    loadLanguage(language);
    if (localization[language]) {
        if (localization[language][key]) {
            return localization[language][key];
        }
    }
    if (localization[FALLBACK_LANGUAGE]) {
        if (localization[FALLBACK_LANGUAGE][key]) {
            return localization[FALLBACK_LANGUAGE][key];
        }
    }
    return key;
}
