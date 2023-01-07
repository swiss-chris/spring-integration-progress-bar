import {Duration, Percent, Progress, Time} from "../../lib";

describe('Progress', () => {
    const start = new Time(1672866000000); // 22:00:00
    const plus30 = new Time(1672867800000); // 22:30:00
    const plus60 = new Time(1672956000000); // 23:00:00
    const plus120 = new Time(1672959600000); // 00:00:00
    const percent50 = new Percent(50);
    const duration30 = new Duration(30 * 60 * 1000); // 30 minutes
    const progress50Percent30Minutes = new Progress(start, plus30, percent50);

    test('Progress.copy()', () => {
        expect(progress50Percent30Minutes.copy(percent50, plus30).end().toString()).toBe(plus60.toString());
        expect(progress50Percent30Minutes.copy(percent50, plus60).end().toString()).toBe(plus120.toString());
        expect(progress50Percent30Minutes.copy(new Percent(25), plus30).end().toString()).toBe(plus120.toString());
    });

    test('Progress.isFinished()', () => {
        expect(new Progress(start, plus30, new Percent(0)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(50)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(99)).isFinished()).toBeFalsy();
        expect(new Progress(start, plus30, new Percent(100)).isFinished()).toBeTruthy();
    });

    test('Progress.percentNotZero()', () => {
        expect(progress50Percent30Minutes.percent().toString()).toBe('50%');
    });

    test('Progress.duration()', () => {
        expect(progress50Percent30Minutes.duration().toString()).toBe(duration30.toString());
    });

    test('Progress.remaining()', () => {
        expect(progress50Percent30Minutes.remaining()!.toString()).toBe(duration30.toString());
    });

    test('Progress.end()', () => {
        expect(progress50Percent30Minutes.end().toString()).toBe(plus60.toString());
        expect(new Progress(start, plus60, percent50).end().toString()).toBe(plus120.toString());
    });
});
