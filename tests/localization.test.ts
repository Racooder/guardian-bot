import { localize } from "../src/Localization";
import { setupLog } from "../src/Log";

setupLog();

describe('Localization - getLocalizedText', () => {
    test('Valid key and language should result in the localized text', () => {
        expect(localize('test.1', 'en')).toBe('This is a test');
        expect(localize('test.1', 'de')).toBe('Das ist ein Test');
    });
    test('Valid key and invalid language should result in the fallback language', () => {
        expect(localize('test.1', 'invalid')).toBe('This is a test');
        expect(localize('test.2', 'de')).toBe('This is another test');
    });
    test('Invalid key should result in the key', () => {
        expect(localize('test.invalid', 'en')).toBe('test.invalid');
        expect(localize('test.invalid', 'de')).toBe('test.invalid');
    });
});
