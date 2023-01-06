const {Time, Duration} = require('../../static/script/lib');

describe('Time', () => {
    const start = new Time(1672866000000); // 22:00:00
    const now = new Time(1672867800000); // 22:30:00
    const duration = new Duration(30 * 60 * 1000); // 30 minutes

    test('Time.toString()', () => {
        expect(start.toString()).toBe('22:00:00');
    });

    test('Time.plus()', () => {
        expect(start.plus(duration).toString()).toBe('22:30:00');
    });

    test('Time.difference()', () => {
        expect(start.difference(now).toString()).toBe('00:30:00');
        expect(now.difference(start).toString()).toBe('00:30:00');
    });
});
