import {Percent} from '../../../main/typescript/progress/percent';

describe('Percent', () => {
    test('Initializing Percent objects', () => {
        expect(() => new Percent(-1)).toThrowError();
        expect(() => new Percent(101)).toThrowError();
        expect(new Percent(0).equals(Percent.ZERO_PERCENT)).toBeTruthy();
        expect(new Percent(100).equals(Percent.ONE_HUNDRED_PERCENT)).toBeTruthy();
        expect(new Percent(0).isZero()).toBeTruthy();
        expect(new Percent(100).isOneHundred()).toBeTruthy();
        const other = new Percent(42);
        expect(other.equals(Percent.ZERO_PERCENT)).toBeFalsy();
        expect(other.equals(Percent.ONE_HUNDRED_PERCENT)).toBeFalsy();
    });

    test('Percent.remaining()', () => {
        expect(new Percent(42).remaining().equals(new Percent(58))).toBeTruthy();
    });

    test('Percent.minus()', () => {
        expect(new Percent(42).minus(new Percent(12)).equals(new Percent(30))).toBeTruthy();
    });

    test('Percent.divideBy()', () => {
        expect(new Percent(100).divideBy(new Percent(25))).toBe(4);
    });

    test('Percent.value()', () => {
        expect(new Percent(42).format(percentFormatter)).toBe('42%');
    });

    test('Percent.format()', () => {
        expect(new Percent(42.5).format(percentFormatter)).toBe('42.5%');
    });
});

export const percentFormatter = (percent: number) => {
    return percent + '%';
}
