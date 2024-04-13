import { Client, EmbedBuilder } from "discord.js";
import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { createGzip } from "zlib";
import config from "../meta/config.json";
import embedColors from "../data/embed-colors.json";

const format = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    FgGray: "\x1b[90m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
    BgGray: "\x1b[100m",
};

const folderPath = "./logs";
const latestPath = `${folderPath}/latest.txt`;

export function debug(message: string): EmbedBuilder {
    if (config.debug === true) {
        log(message, "[DEBUG]  ", format.FgGray);
    }
    return new EmbedBuilder()
        .setTitle("Debug")
        .setDescription(message)
        .setColor(embedColors.log_debug);
}

export function info(message: string): EmbedBuilder {
    log(message, "[INFO]   ", format.FgWhite);
    return new EmbedBuilder()
        .setTitle("Info")
        .setDescription(message)
        .setColor(embedColors.log_info);
}

export function success(message: string): EmbedBuilder {
    log(message, "[SUCCESS]", format.FgGreen);
    return new EmbedBuilder()
        .setTitle("Success")
        .setDescription(message)
        .setColor(embedColors.log_success);
}

export function warn(message: string): EmbedBuilder {
    log(message, "[WARN]   ", format.FgYellow);
    return new EmbedBuilder()
        .setTitle("Warn")
        .setDescription(message)
        .setColor(embedColors.log_warning);
}

export function error(message: string): EmbedBuilder {
    log(message, "[ERROR]  ", format.FgRed);
    return new EmbedBuilder()
        .setTitle("Error")
        .setDescription(message)
        .setColor(embedColors.log_error);
}

export async function logToDiscord(client: Client, embed: EmbedBuilder) {
    const channel = await client.channels.fetch(config.log_channel);
    if (channel && channel.isTextBased()) {
        channel.send({
            content: "<@&" + config.log_role + ">",
            embeds: [embed],
        });
    }
}

function log(message: string, prefix: string, color = "", doSave = true) {
    const localTime = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
    console.log(color, localTime, prefix, message, format.Reset);

    if (doSave) {
        const msg = `${localTime} ${prefix} ${message}`;
        save(msg);
    }
}

function save(message: string): void {
    writeFileSync(latestPath, `${message}\n`, { flag: "a" });
}

export async function setupLog(): Promise<void> {
    existsSync(folderPath) || mkdirSync(folderPath);
    if (existsSync(latestPath)) {
        const targetPath = `${folderPath}/${new Date().toISOString()}.txt.gz`.replace(/:/g, "-");

        // Compress the latest file
        return new Promise<void>((resolve, reject) => {
            const stream = createReadStream(latestPath);
            stream
                .pipe(createGzip())
                .pipe(createWriteStream(targetPath))
                .on("finish", () => {
                    createWriteStream(latestPath).write("");
                    resolve();
                });
        });
    } else {
        writeFileSync(latestPath, "");
    }
}
