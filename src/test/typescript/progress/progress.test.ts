import { Progress } from "../../../main/typescript/progress";

describe('Progress', () => {
    const plus120 = new Date(1672959600000); // 00:00:00

    test('0 percent', () => {
        const start = new Date(1672866000000);
        const percent0 = 0;
        const progress0Percent = Progress.create(start, start, percent0);
        const duration0 = '00:00:00';

        expect(progress0Percent.isFinished()).toBeFalsy();
        expect(progress0Percent.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
        expect(progress0Percent.percent().isZero()).toBeTruthy();
        expect(progress0Percent.duration().toString()).toBe(duration0.toString());
        expect(progress0Percent.remaining()).toBeUndefined();
        expect(progress0Percent.end()).toBeUndefined();
    });

    test('50 percent 30 minutes', () => {
        const start = new Date(1672866000000); // 22:00:00
        const plus30 = new Date(1672867800000); // 22:30:00
        const percent50 = 50;
        const progress50Percent30Minutes = Progress.create(start, plus30, percent50);
        const duration30 = '00:30:00'; // 30 minutes
        const plus60 = new Date(1672956000000); // 23:00:00

        expect(progress50Percent30Minutes.isFinished()).toBeFalsy();
        expect(progress50Percent30Minutes.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
        expect(progress50Percent30Minutes.percent().isZero()).toBeFalsy();
        expect(progress50Percent30Minutes.duration().toString()).toBe(duration30.toString());
        expect(progress50Percent30Minutes.remaining()!.toString()).toBe(duration30.toString());
        expect(progress50Percent30Minutes.end()!.date().toLocaleTimeString()).toBe(plus60.toLocaleTimeString());
    });
});
