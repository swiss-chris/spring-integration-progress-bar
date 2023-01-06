import {Duration, Percent, Progress, Time} from "../../script/lib";

describe('Progress', () => {
    const start = new Time(1672866000000); // 22:00:00
    const plus30 = new Time(1672867800000); // 22:30:00
    const plus60 = new Time(1672956000000); // 23:00:00
    const plus120 = new Time(1672959600000); // 00:00:00
    const percentNotZero = new Percent(50);
    const duration = new Duration(30 * 60 * 1000); // 30 minutes
    const progressStarted = new Progress(start, plus30, percentNotZero);

    test('Progress.copy()', () => {
        expect(progressStarted.copy(percentNotZero, plus30).start().toString()).toBe(start.toString());
        expect(progressStarted.copy(percentNotZero, plus30).end().toString()).toBe(plus60.toString());
        expect(progressStarted.copy(percentNotZero, plus60).start().toString()).toBe(start.toString());
        expect(progressStarted.copy(percentNotZero, plus60).end().toString()).toBe(plus120.toString());
        expect(progressStarted.copy(new Percent(25), plus30).start().toString()).toBe(start.toString());
        expect(progressStarted.copy(new Percent(25), plus30).end().toString()).toBe(plus120.toString());
    });

    test('Progress.isFinished()', () => {
        expect(new Progress(start, plus30, new Percent(0)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(50)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(99)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(100)).isFinished()).toBeTruthy();
    });

    test('Progress.percentNotZero()', () => {
        expect(progressStarted.percent().toString()).toBe('50%');
    });

    test('Progress.start()', () => {
        expect(progressStarted.start().toString()).toBe(start.toString());
    });

    test('Progress.duration()', () => {
        expect(progressStarted.duration().toString()).toBe(duration.toString());
    });

    test('Progress.remaining()', () => {
        expect(progressStarted.remaining()!.toString()).toBe(duration.toString());
    });

    test('Progress.end()', () => {
        expect(progressStarted.end().toString()).toBe(plus60.toString());
    });
});
