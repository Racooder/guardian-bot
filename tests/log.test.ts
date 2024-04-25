import { debug, error, info, setupLog, success, warn } from "../src/Log";

setupLog();

describe('Log - loggers', () => {
    const logSpy = jest.spyOn(console, 'log');

    test('debug should log the message with the correct prefix and color', () => {
        debug("test", true);
        expect(logSpy).toHaveBeenCalledWith("\x1b[90m", expect.anything(), "[DEBUG]  ", "test", "\x1b[0m");
    });
    test('info should log the message with the correct prefix and color', () => {
        info("test");
        expect(logSpy).toHaveBeenCalledWith("\x1b[37m", expect.anything(), "[INFO]   ", "test", "\x1b[0m");
    });
    test('success should log the message with the correct prefix and color', () => {
        success("test");
        expect(logSpy).toHaveBeenCalledWith("\x1b[32m", expect.anything(), "[SUCCESS]", "test", "\x1b[0m");
    });
    test('warn should log the message with the correct prefix and color', () => {
        warn("test");
        expect(logSpy).toHaveBeenCalledWith("\x1b[33m", expect.anything(), "[WARN]   ", "test", "\x1b[0m");
    });
    test('error should log the message with the correct prefix and color', () => {
        error("test");
        expect(logSpy).toHaveBeenCalledWith("\x1b[31m", expect.anything(), "[ERROR]  ", "test", "\x1b[0m");
    });

    afterAll(() => {
        logSpy.mockRestore();
    });
});

describe('Log - returns', () => {
    test('debug should return an EmbedBuilder with the correct title, description and color', () => {
        const embed = debug("test");
        expect(embed.data.title).toBe("Debug");
        expect(embed.data.description).toBe("test");
        expect(embed.data.color).toBe(0xaaaaaa);
    });
    test('info should return an EmbedBuilder with the correct title, description and color', () => {
        const embed = info("test");
        expect(embed.data.title).toBe("Info");
        expect(embed.data.description).toBe("test");
        expect(embed.data.color).toBe(0x000000);
    });
    test('success should return an EmbedBuilder with the correct title, description and color', () => {
        const embed = success("test");
        expect(embed.data.title).toBe("Success");
        expect(embed.data.description).toBe("test");
        expect(embed.data.color).toBe(0x00aa00);
    });
    test('warn should return an EmbedBuilder with the correct title, description and color', () => {
        const embed = warn("test");
        expect(embed.data.title).toBe("Warn");
        expect(embed.data.description).toBe("test");
        expect(embed.data.color).toBe(0xaaaa00);
    });
    test('error should return an EmbedBuilder with the correct title, description and color', () => {
        const embed = error("test");
        expect(embed.data.title).toBe("Error");
        expect(embed.data.description).toBe("test");
        expect(embed.data.color).toBe(0xaa0000);
    });
});
