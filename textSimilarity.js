/**
 * Compares two strings with each other
 * @param {String} s1 - The first string
 * @param {String} s2 - The second string
 * @returns The similarity between the two strings
 */
module.exports = (s1, s2) => {
    /**
     * Converts a string into trigrams
     * @param {String} s - The string to convert
     * @returns The trigrams of the string
     */
    function toTrigrams (s) {
        if (s.length <= 3) {
            return [s];
        }
        let trigrams = [];
        for (let i = 1; i < s.length - 1; i++) {
            trigrams.push(s[i - 1] + s[i] + s[i + 1]);
        }
        return trigrams;
    }

    const trigrams1 = toTrigrams(s1);
    const trigrams2 = toTrigrams(s2);

    let similarity = 0;
    for (const t1 of trigrams1) {
        for (const t2 of trigrams2) {
            if (t1 == t2) {
                similarity++;
            }
        }
    }

    similarity = similarity / trigrams1.length;
    
    return similarity;
}