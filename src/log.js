module.exports = {
    /**
     * Logs the given message to the console
     * @param {String} message - The message to be sent
     */
    log: (message) => {
        console.log(`[LOG: ${new Date().toISOString()}] ${message}`);
    },
    /**
     * Logs the given message as a error to the console
     * @param {String} message - The message to be sent
     */
    error: (message) => {
        console.log(`[ERROR: ${new Date().toISOString()}] ${message}`);
    },
    /**
     * Logs the given message as a success to the console
     * @param {String} message - The message to be sent
     */
    success: (message) => {
        console.log(`[SUCCESS: ${new Date().toISOString()}] ${message}`);
    },
    /**
     * Logs the given message as a warning to the console
     * @param {String} message - The message to be sent
     */
    warn: (message) => {
        console.log(`[WARN: ${new Date().toISOString()}] ${message}`);
    }
}
