import { replaceAfterColon } from '../../../main/typescript/util/string-utils';

describe('string-utils', () => {
    test('getHost()', () => {
        const replacementString = '8080';

        expect(replaceAfterColon('', replacementString)).toBe('');
        expect(replaceAfterColon('something', replacementString)).toBe('something');
        expect(replaceAfterColon('something:withcolon', replacementString)).toBe(`something:${replacementString}`);
    });
});
