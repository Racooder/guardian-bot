const { readFile } = require('fs');

module.exports = {
    /**
     * Reads the first line of the given file
     * @param {string} file - The file to read
     * @returns {string} The first line of the file
     */
    readFirstLine(file) {
        return new Promise((resolve, reject) => {
            readFile(file, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.split('\n')[0]);
                }
            });
        });
    },
    /**
     * Reads the given file split by the given separator
     * @param {string} file - The file to read
     * @param {string} separator - The separator to split the file by
     * @returns {string[]} The lines of the file
     */
    readFileSplit(file, separator) {
        return new Promise((resolve, reject) => {
            readFile(file, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.split(separator));
                }
            });
        });
    },
    /**
     * Reads the given file and returns the data as an array in the changelog format
     * Format: [[title, description], [title, description], ...]
     * @param {string} file - The file to read
     * @returns {string[][]} The lines of the file
     */
    readFileChangelog(file = './changelog') {
        return new Promise((resolve, reject) => {
            readFile(file, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const lines = data.split(/\r?\n\r?\n\r?\n/);
                    const changelog = [];
                    for (let i = 0; i < lines.length; i++) {
                        const title = lines[i].split('\n')[0];
                        const description = lines[i].split('\n').slice(1).join('\n');
                        changelog.push([title, description]);
                    }
                    resolve(changelog);
                }
            });
        });
    }
};