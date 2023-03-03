import { replaceAfterColon } from '../../../main/svelte/vite-project/src/lib/util/string-utils';

describe('string-utils', () => {
    test('getHost()', () => {
        const replacementString = '8080';

        expect(replaceAfterColon('', replacementString)).toBe('');
        expect(replaceAfterColon('something', replacementString)).toBe('something');
        expect(replaceAfterColon('something:withcolon', replacementString)).toBe(`something:${replacementString}`);
        expect(replaceAfterColon('something:', replacementString)).toBe(`something:${replacementString}`);
    });
});
