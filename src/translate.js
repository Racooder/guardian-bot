const log = require('./log.js');
const { existsSync } = require('fs');

/**
 * Translates the given text into another
 * @param {String} key - The text key
 * @param {String} dictionary - The dictionary key
 * @returns {String} The text in the given language.
 */
module.exports = (key, dictionary) => {
    try {
        if (existsSync(`./src/dictionaries/${dictionary}.json`)) {
            let translation = require(`./dictionaries/${dictionary}`)[key];

            if (translation == null || translation == ""){
                translation = require('./dictionaries/game/en.json')[key];
            }

            if (translation == null || translation == ""){
                translation = "This text does not exist. (Please report this to the developer)";
            }

            return translation;
        }
        else{
            return null;
        }
    } catch(err) {
        log.error(err)
    }
}
