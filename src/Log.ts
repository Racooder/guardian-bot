import { Client, EmbedBuilder } from "discord.js";
import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    writeFileSync,
} from "fs";
import { createGzip } from "zlib";

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

export const debug = (message: string) => {
    if (process.env.DEBUG === "true") {
        log(message, "[DEBUG]  ", format.FgGray);
    }
};

export const info = (message: string) => {
    log(message, "[INFO]   ", format.FgWhite);
};

export const success = (message: string) => {
    log(message, "[SUCCESS]", format.FgGreen);
};

export const warn = (message: string) => {
    log(message, "[WARN]   ", format.FgYellow);
};

export const error = (message: string, client?: Client) => {
    log(message, "[ERROR]  ", format.FgRed);

    const errorChannel = process.env.ERROR_CHANNEL;
    if (client && errorChannel) {
        client.channels.fetch(errorChannel).then((channel) => {
            if (channel && channel.isTextBased()) {
                const messageEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription(message)
                    .setColor(0xaa0000);
                channel.send({
                    content: "<@&" + process.env.ERROR_ROLE + ">",
                    embeds: [messageEmbed],
                });
            }
        });
    }
};

const log = (message: string, prefix: string, color = "", doSave = true) => {
    const msg = `${new Date().toLocaleString("en-GB", {
        timeZone: "UTC",
    })} ${prefix} ${message}`;
    console.log(color, msg, format.Reset);
    if (doSave) {
        save(msg);
    }
};

const save = (message: string) => {
    writeFileSync(latestPath, `${message}\n`, { flag: "a" });
};

export const setupLog = async () => {
    existsSync(folderPath) || mkdirSync(folderPath);
    if (existsSync(latestPath)) {
        const targetPath =
            `${folderPath}/${new Date().toISOString()}.txt.gz`.replace(
                /:/g,
                "-"
            );

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
};
