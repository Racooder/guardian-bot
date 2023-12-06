import { approximateEqual, parseDate, randomElement, splitArrayIntoChunks } from "../src/Essentials";

describe('Essentials - isGuildCommand', () => {
    test('DM interaction should result in false', () => {
        expect(true).toBe(true); //TODO: Implement
    });
});

describe('Essentials - splitArrayIntoChunks', () => {
    test('Empty array should result in empty array', () => {
        expect(splitArrayIntoChunks([], 1)).toStrictEqual([]);
    });
    test('Array with one element should result in an array containing the original array', () => {
        expect(splitArrayIntoChunks([1], 1)).toStrictEqual([[1]]);
    });
    test('Chunk sizes smaller than the array length should result in an array of chunks', () => {
        expect(splitArrayIntoChunks([1, 2, 3], 2)).toStrictEqual([[1, 2], [3]]);
        expect(splitArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8], 3)).toStrictEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
    });
    test('A chunk size that is the same as the array length should result in an array containing the original array', () => {
        expect(splitArrayIntoChunks([1, 2, 3], 3)).toStrictEqual([[1, 2, 3]]);
    });
    test('Chunk sizes larger as the array lenght should result in an array containing the original array', () => {
        expect(splitArrayIntoChunks([1, 2, 3], 4)).toStrictEqual([[1, 2, 3]]);
    });
    test('A chunk size of 0 or less should result in an error', () => {
        expect(() => { splitArrayIntoChunks([1, 2, 3], 0) }).toThrow(Error("chunkSize must be greater than 0"));
        expect(() => { splitArrayIntoChunks([1, 2, 3], -1) }).toThrow(Error("chunkSize must be greater than 0"));
    });
});

describe('Essentials - approximateEqual', () => {
    test('Numbers that are approximately equal should result in true', () => {
        expect(approximateEqual(1, 1.0000000000001, 0.0000000000001)).toBe(true);
        expect(approximateEqual(7, 7.00002, 0.00005)).toBe(true);
    });
    test('Numbers that are not approximately equal should result in false', () => {
        expect(approximateEqual(1, 1.0000000000001, 0.00000000000001)).toBe(false);
        expect(approximateEqual(7, 7.00002, 0.00001)).toBe(false);
    });
});

describe('Essentials - randomElement', () => {
    test('An empty array should result in an error', () => {
        expect(() => { randomElement([]) }).toThrow();
    });
    test('An array with one element should result in that element', () => {
        expect(randomElement([1])).toBe(1);
    });
    test('An array with multiple elements should result in one of those elements', () => {
        expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).toContain(randomElement([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    });
});

describe('Essentials - parseDate', () => {
    test('A valid date string should result in a date', () => {
        expect(parseDate("2021-01-01")).toBeInstanceOf(Date);
    });
    test('An invalid date string should result in undefined', () => {
        expect(parseDate("2021-01-32")).toBeUndefined();
        expect(parseDate("01-01-2021")).toBeUndefined();
        expect(parseDate("test")).toBeUndefined();
    });
    test('A null date string should result in undefined', () => {
        expect(parseDate(null)).toBeUndefined();
    });
});
