import {ArrayUtils} from '../../../main/typescript/page/util';

describe('ArrayUtils', () => {
    test('ArrayUtils.getInsertionIndex()', () => {
        expect(ArrayUtils.getInsertionIndex([1,3,4,5], 2)).toBe(1);
        expect(ArrayUtils.getInsertionIndex([1,3,4,5], 2, true)).toBe(1);
        expect(ArrayUtils.getInsertionIndex([5,4,3,1], 2, true)).toBe(1);
        expect(ArrayUtils.getInsertionIndex([1,3,4,5], 2, false)).toBe(3);
        expect(ArrayUtils.getInsertionIndex([5,4,3,1], 2, false)).toBe(3);
    });
});
