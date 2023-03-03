import { Duration, Time } from '../../../main/svelte/src/lib/rows/progress/lib';
import { expect, test } from 'vitest'

test('Duration', () => {
    test('Initializing Duration objects', () => {
        expect(() => new Duration(-1)).toThrowError();
        expect(() => new Duration(0)).not.toThrowError();
    });

    test('ofSeconds()', () => {
        expect(Duration.ofSeconds(0).toString()).toBe('00:00:00');
        expect(Duration.ofSeconds(1).toString()).toBe('00:00:01');
        expect(Duration.ofSeconds(60).toString()).toBe('00:01:00');
    });

    test('isLessThan()', () => {
        expect(new Duration(0).isLessThan(new Duration(1))).toBeTruthy();
        expect(new Duration(1).isLessThan(new Duration(0))).toBeFalsy();
    });

    test('isGreaterThan()', () => {
        expect(new Duration(0).isGreaterThan(new Duration(1))).toBeFalsy();
        expect(new Duration(1).isGreaterThan(new Duration(0))).toBeTruthy();
    });

    test('times()', () => {
        expect(new Duration(0).times(100).toString()).toBe('00:00:00');
        expect(new Duration(0).times(100).isLessThan(new Duration(1))).toBeTruthy();
        expect(new Duration(1).times(1000).toString()).toBe('00:00:01');
        expect(new Duration(1000).times(5).toString()).toBe('00:00:05');
    });

    test('addTo()', () => {
        const time = new Time(1672866000000); // 21:00:00 UTC
        const duration = Duration.ofSeconds(60);
        expect(duration.addTo(time).date().toLocaleTimeString()).toBe(time.plus(duration).date().toLocaleTimeString());
    });

    test('toString()', () => {
        expect(new Duration(0).toString()).toBe('00:00:00');
        expect(new Duration(999).toString()).toBe('00:00:00');
        expect(new Duration(1000).toString()).toBe('00:00:01');
        expect(new Duration(1001).toString()).toBe('00:00:01');
        expect(new Duration(toMillis(0, 0, 1)).toString()).toBe('00:00:01');
        expect(new Duration(toMillis(0, 0, 59)).toString()).toBe('00:00:59');
        expect(new Duration(toMillis(0, 1, 0)).toString()).toBe('00:01:00');
        expect(new Duration(toMillis(0, 59, 59)).toString()).toBe('00:59:59');
        expect(new Duration(toMillis(0, 60, 0)).toString()).toBe('01:00:00');
        expect(new Duration(toMillis(1, 0, 0)).toString()).toBe('01:00:00');
        expect(new Duration(toMillis(60, 0, 0)).toString()).toBe('60:00:00');
        expect(new Duration(toMillis(1234, 59, 59)).toString()).toBe('1234:59:59');
    });

    test('format()', () => {
        expect(new Duration(1234).format(formatter)).toBe('some custom format: 1234');
    });
});

const toMillis = (hours: number, minutes: number, seconds: number) => ((hours * 60 + minutes) * 60 + seconds) * 1000;

const formatter = (millis: number) => `some custom format: ${millis}`;
