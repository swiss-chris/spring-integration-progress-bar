import { getInsertionIndex } from '../../../main/typescript/util';

describe('ArrayUtils', () => {
    test('getInsertionIndex() of different element', () => {
        expect(getInsertionIndex([1,3,4,5], 2)).toBe(1);
        expect(getInsertionIndex([1,3,4,5], 2, true)).toBe(1);
        expect(getInsertionIndex([5,4,3,1], 2, true)).toBe(1);
        expect(getInsertionIndex([1,3,4,5], 2, false)).toBe(3);
        expect(getInsertionIndex([5,4,3,1], 2, false)).toBe(3);
    });

    test('getInsertionIndex() of element already in array', () => {
        expect(getInsertionIndex([1,2,2,4,5], 2)).toBe(1);
    });
});
