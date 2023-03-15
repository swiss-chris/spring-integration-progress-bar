import { describe, test, expect } from 'vitest';
import { RowPresenter } from '@/presentation/row-presenter';
import { FlowProgress } from '@/usecase/flow/flow-progress';
import { Progress } from '@/usecase/progress';
import { utcTimeFormatter } from '../core/time.test';

describe('row-presenter', () => {

    const rowPresenter = new RowPresenter(utcTimeFormatter);

    const second_0 = new Date(0);
    const second_1 = new Date(1_000);
    const second_3 = new Date(3_000);
    const second_14 = new Date(14_000);
    const second_62 = new Date(62_000);
    const somePercentPerSecond = 12345;

    test('a row at 0% progress', () => {
        const row = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_0, 0),
            {percentPerSecond: somePercentPerSecond}
        ));

        expectResults(row,
            'flowId',
            `${somePercentPerSecond}%`,
            '0%',
            '24:00:00',
            '00:00:00',
            '00:00:00',
            '',
            '',
            '',
            'dim'
        );
    });

    test('a row at 50% progress', () => {
        const row = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_3, 50),
            {percentPerSecond: somePercentPerSecond}
        ));

        expectResults(row,
            'flowId',
            `${somePercentPerSecond}%`,
            '50%',
            '24:00:00',
            '00:00:03',
            '00:00:00',
            '',
            '00:00:03',
            '24:00:06',
            'dim'
        );
    });

    test('a row at 1% progress who\'s update is late', () => {
        const row = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_14, 1, second_1),
            {percentPerSecond: somePercentPerSecond}
        ));

        expectResults(row,
            'flowId',
            `${somePercentPerSecond}%`,
            '1%',
            '24:00:00',
            '00:00:14',
            '00:00:13',
            'orange',
            '00:01:26',
            '24:01:40',
            'dim'
        );
    });

    test('a row at 1% progress who\'s update is very late', () => {
        const row = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_62, 1, second_1),
            {percentPerSecond: somePercentPerSecond}
        ));

        expectResults(row,
            'flowId',
            `${somePercentPerSecond}%`,
            '1%',
            '24:00:00',
            '00:01:02',
            '00:01:01',
            'orangered',
            '00:00:38',
            '24:01:40',
            'dim'
        );
    });

    test('a row at 100% progress', () => {
        const row = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_3, 100, second_3),
            {percentPerSecond: somePercentPerSecond}
        ));

        expectResults(row,
            'flowId',
            `${somePercentPerSecond}%`,
            '100%',
            '24:00:00',
            '00:00:03',
            '00:00:00',
            '',
            '00:00:00',
            '24:00:03',
            ''
        );
    });
});
export const expectResults = (
    {
        flowId,
        percentPerSecond,
        percent,
        start,
        duration,
        timeSinceLastUpdate,
        timeSinceLastUpdateColor,
        remaining,
        end,
        endColorClass
    },
    expectedFlowId,
    expectedPercentPerSecond,
    expectedPercent,
    expectedStart,
    expectedDuration,
    expectedTimeSinceLastUpdate,
    expectedTimeSinceLastUpdateColor,
    expectedRemaining,
    expectedEnd,
    expectedEndColorClass
) => {
    expect(flowId).toEqual(expectedFlowId);
    expect(percentPerSecond).toEqual(expectedPercentPerSecond)
    expect(percent).toEqual(expectedPercent);
    expect(start).toEqual(expectedStart);
    expect(duration).toEqual(expectedDuration);
    expect(timeSinceLastUpdate).toEqual(expectedTimeSinceLastUpdate);
    expect(timeSinceLastUpdateColor).toEqual(expectedTimeSinceLastUpdateColor);
    expect(remaining).toEqual(expectedRemaining);
    expect(end).toEqual(expectedEnd);
    expect(endColorClass).toEqual(expectedEndColorClass);
};
