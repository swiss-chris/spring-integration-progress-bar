import { test, expect } from 'vitest';
import { update } from '../../../main/typescript/usecase/timer-update-received';
import { Progress } from '../../../main/typescript/usecase/lib/progress';
import { Time, Percent, Duration } from '../../../main/typescript/core';

test('timer-update-received', () => {
    const percent = 50;
    const startMillis = 0;
    const lastUpdate = 1000;
    const durationMillis = 1500;
    const end = 2000;
    const currentProgress = Progress.create(new Date(startMillis), new Date(lastUpdate), percent);

    const updatedProgress = update(currentProgress, new Date(durationMillis));

    expect(updatedProgress.percent()).toEqual(new Percent(percent))
    expect(updatedProgress.start()).toEqual(new Time(startMillis))
    expect(updatedProgress.duration()).toEqual(new Time(durationMillis))
    expect(updatedProgress.timeSinceLastUpdate()).toEqual(new Duration(durationMillis - lastUpdate));
    expect(updatedProgress.remaining()).toEqual(new Duration(end - durationMillis));
    expect(updatedProgress.end()).toEqual(new Time(end));
    expect(updatedProgress.isFinished()).toBeFalsy()
})
