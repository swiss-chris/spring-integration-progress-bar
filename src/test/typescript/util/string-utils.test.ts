import { replaceAfterColon } from '../../../main/typescript/lib/util/string-utils';
import { expect, test } from 'vitest'

test('string-utils', () => {
    test('getHost()', () => {
        const replacementString = '8080';

        expect(replaceAfterColon('', replacementString)).toBe('');
        expect(replaceAfterColon('something', replacementString)).toBe('something');
        expect(replaceAfterColon('something:withcolon', replacementString)).toBe(`something:${replacementString}`);
        expect(replaceAfterColon('something:', replacementString)).toBe(`something:${replacementString}`);
    });
});
