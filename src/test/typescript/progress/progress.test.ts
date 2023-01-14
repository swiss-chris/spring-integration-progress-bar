import { Progress } from "../../../main/typescript/page/rows/progress";

describe('Progress', () => {
    test('0 percent', () => {
        const start = new Date(1672866000000);
        const percent0 = 0;
        const progress0Percent = Progress.create(start, start, percent0);
        const duration0 = '00:00:00';

        expect(progress0Percent.isFinished()).toBeFalsy();
        expect(progress0Percent.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
        expect(progress0Percent.percent().isZero()).toBeTruthy();
        expect(progress0Percent.percent().isOneHundred()).toBeFalsy();
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
        expect(progress50Percent30Minutes.percent().isOneHundred()).toBeFalsy();
        expect(progress50Percent30Minutes.duration().toString()).toBe(duration30.toString());
        expect(progress50Percent30Minutes.remaining()!.toString()).toBe(duration30.toString());
        expect(progress50Percent30Minutes.end()!.date().toLocaleTimeString()).toBe(plus60.toLocaleTimeString());
    });

    test('100 percent 60 minutes', () => {
        const start = new Date(1672866000000); // 22:00:00
        const plus60 = new Date(1672869600000); // 23:00:00
        const percent100 = 100;
        const progress100Percent60Minutes = Progress.create(start, plus60, percent100);
        const duration0 = '00:00:00';
        const duration60 = '01:00:00';

        expect(progress100Percent60Minutes.isFinished()).toBeTruthy();
        expect(progress100Percent60Minutes.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
        expect(progress100Percent60Minutes.percent().isZero()).toBeFalsy();
        expect(progress100Percent60Minutes.percent().isOneHundred()).toBeTruthy();
        expect(progress100Percent60Minutes.duration().toString()).toBe(duration60.toString());
        expect(progress100Percent60Minutes.remaining()!.toString()).toBe(duration0.toString());
        expect(progress100Percent60Minutes.end()!.date().toLocaleTimeString()).toBe(plus60.toLocaleTimeString());
    });

    test('updateTime', () => {
        const start = new Date(1672866000000); // 22:00:00
        const plus30 = new Date(1672867800000); // 22:30:00
        const plus60 = new Date( 1672869600000); // 23:00:00
        const plus120 = new Date(1672873200000); // 24:00:00
        const percent50 = 50;
        const progress50Percent30Minutes = Progress.create(start, plus30, percent50);
        const duration30 = '00:30:00'; // 60 minutes
        const duration60 = '01:00:00'; // 60 minutes

        const progress50Percent60Minutes = progress50Percent30Minutes.updateTime(plus60);
        expect(progress50Percent60Minutes.isFinished()).toBeFalsy();
        expect(progress50Percent60Minutes.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
        expect(progress50Percent60Minutes.percent().isZero()).toBeFalsy();
        expect(progress50Percent60Minutes.percent().isOneHundred()).toBeFalsy();
        expect(progress50Percent60Minutes.duration().toString()).toBe(duration60.toString());
        expect(progress50Percent60Minutes.timeSinceLastUpdate().toString()).toBe(duration30.toString());
        expect(progress50Percent60Minutes.remaining()!.toString()).toBe(duration60.toString());
        expect(progress50Percent60Minutes.end()!.date().toLocaleTimeString()).toBe(plus120.toLocaleTimeString());
    })

    test('updatePercent', () => {
        const start = new Date(1672866000000); // 22:00:00
        const plus30 = new Date(1672867800000); // 22:30:00
        const plus45 = new Date(1672868700000); // 22:45:00
        const plus60 = new Date(1672869600000); // 23:00:00
        const percent50 = 50;
        const progress50Percent30Minutes = Progress.create(start, plus30, percent50);
        const duration00 = '00:00:00'; // 30 minutes
        const duration15 = '00:15:00'; // 30 minutes
        const duration45 = '00:45:00'; // 30 minutes

        const progress50Percent60Minutes = progress50Percent30Minutes.updatePercent(plus45, 75);
        expect(progress50Percent60Minutes.isFinished()).toBeFalsy();
        expect(progress50Percent60Minutes.start().date().toLocaleTimeString()).toBe(start.toLocaleTimeString());
        expect(progress50Percent60Minutes.percent().isZero()).toBeFalsy();
        expect(progress50Percent60Minutes.percent().isOneHundred()).toBeFalsy();
        expect(progress50Percent60Minutes.duration().toString()).toBe(duration45.toString());
        expect(progress50Percent60Minutes.timeSinceLastUpdate().toString()).toBe(duration00.toString());
        expect(progress50Percent60Minutes.remaining()!.toString()).toBe(duration15.toString());
        expect(progress50Percent60Minutes.end()!.date().toLocaleTimeString()).toBe(plus60.toLocaleTimeString());
    })
});
