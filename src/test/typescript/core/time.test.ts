import { Duration, Time } from "main-typescript/core";
import { expect, test, describe } from 'vitest'

describe('Time', () => {
    const startMillis = 1672866000000; // 21:00:00 UTC
    const start = new Time(startMillis);
    const now = new Time(1672867800000); // 21:30:00 UTC
    const duration = new Duration(30 * 60 * 1000); // 30 minutes

    test('Time.format()', () => {
        expect(start.toString(utcTimeFormatter)).toBe('21:00:00');
    });

    test('Time.plus()', () => {
        expect(start.plus(duration).toString(utcTimeFormatter)).toBe('21:30:00');
    });

    test('Time.differenceTo()', () => {
        expect(start.differenceTo(now).toString()).toBe('00:30:00');
        expect(now.differenceTo(start).toString()).toBe('00:30:00');
    });

    test('Time.date()', () => {
        expect(start.date().getTime()).toBe(startMillis);
    });
});

export const utcTimeFormatter = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        hour12: false,
    }).format(date);
}
