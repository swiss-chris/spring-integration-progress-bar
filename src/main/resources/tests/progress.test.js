const {Progress, Percent, Time} = require('../static/script/lib');

describe('Progress', () => {
    const start = new Time(1672866000000); // 22:00:00
    const now = new Time(1672867800000); // 22:30:00
    const percent = new Percent(50); // 30 minutes
    const progress = new Progress(start, now, percent);

    test('Progress.copy()', () => {
        expect(progress.copy(percent).start().toString()).toBe(start.toString());
        expect(progress.copy(percent).end().toString()).toBe('23:00:00');
        expect(progress.copy(new Percent(25)).start().toString()).toBe('22:00:00');
        expect(progress.copy(new Percent(25)).end().toString()).toBe('00:00:00');
    });

    test('Progress.isFinished()', () => {
        expect(new Progress(start, now, new Percent(0)).isFinished()).toBeFalsy();
        expect(new Progress(start, now, new Percent(50)).isFinished()).toBeFalsy();
        expect(new Progress(start, now, new Percent(99)).isFinished()).toBeFalsy();
        expect(new Progress(start, now, new Percent(100)).isFinished()).toBeTruthy();
    });

    test('Progress.percent()', () => {
        expect(progress.percent().toString()).toBe('50%');
    });

    test('Progress.start()', () => {
        expect(progress.start().toString()).toBe('22:00:00');
    });

    test('Progress.duration()', () => {
        expect(progress.duration().toString()).toBe('00:30:00');
    });

    test('Progress.remaining()', () => {
        expect(progress.remaining().toString()).toBe('00:30:00');
    });

    test('Progress.end()', () => {
        expect(progress.end().toString()).toBe('23:00:00');
    });
});
