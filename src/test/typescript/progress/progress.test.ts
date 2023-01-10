import {Progress} from "../../../main/typescript/progress";
import {percentFormatter} from './percent.test';

describe('Progress', () => {
    const start = new Date(1672866000000); // 22:00:00
    const plus30 = new Date(1672867800000); // 22:30:00
    const plus60 = new Date(1672956000000); // 23:00:00
    const plus120 = new Date(1672959600000); // 00:00:00
    const percent50 = 50;
    const duration30 = '00:30:00'; // 30 minutes
    const progress50Percent30Minutes = Progress.create(start, plus30, percent50);

    test('Progress.isFinished()', () => {
        expect(Progress.create(start, plus30, 0).isFinished()).toBeFalsy();
        expect(Progress.create(start, plus30, 50).isFinished()).toBeFalsy();
        expect(Progress.create(start, plus30, 99).isFinished()).toBeFalsy();
        expect(Progress.create(start, plus30, 100).isFinished()).toBeTruthy();
    });

    test('Progress.percent()', () => {
        expect(progress50Percent30Minutes.percent().format(percentFormatter)).toBe('50%');
    });

    test('Progress.start()', () => {
        expect(progress50Percent30Minutes.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
    });

    test('Progress.duration()', () => {
        expect(progress50Percent30Minutes.duration().toString()).toBe(duration30);
    });

    test('Progress.remaining()', () => {
        expect(progress50Percent30Minutes.remaining()!.toString()).toBe(duration30);
    });

    test('Progress.end()', () => {
        expect(progress50Percent30Minutes.end().date().toTimeString()).toBe(plus60.toTimeString());
        expect(Progress.create(start, plus60, percent50).end().date().toTimeString()).toBe(plus120.toTimeString());
    });
});
