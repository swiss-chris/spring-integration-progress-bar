const {Progress, Percent, Time} = require('../static/script/lib');

describe('Progress', () => {
    const start = new Time(1672866000000); // 22:00:00
    const plus30 = new Time(1672867800000); // 22:30:00
    const plus60 = new Time(1672956000000); // 23:00:00
    const plus120 = new Time(1672959600000); // 00:00:00
    const percent = new Percent(50); // 30 minutes
    const progress = new Progress(start, plus30, percent);

    test('Progress.copy()', () => {
        expect(progress.copy(percent, plus30).start().toString()).toBe(start.toString());
        expect(progress.copy(percent, plus30).end().toString()).toBe(plus60.toString());
        expect(progress.copy(percent, plus60).start().toString()).toBe(start.toString());
        expect(progress.copy(percent, plus60).end().toString()).toBe(plus120.toString());
        expect(progress.copy(new Percent(25), plus30).start().toString()).toBe(start.toString());
        expect(progress.copy(new Percent(25), plus30).end().toString()).toBe(plus120.toString());
    });

    test('Progress.isFinished()', () => {
        expect(new Progress(start, plus30, new Percent(0)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(50)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(99)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(100)).isFinished()).toBeTruthy();
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
