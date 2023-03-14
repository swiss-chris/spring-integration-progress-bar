import { describe, test, expect } from 'vitest';
import { RowPresenter } from '@/presentation/row-presenter';
import { FlowProgress } from '@/usecase/flow/flow-progress';
import { Progress } from '@/usecase/progress';
import { utcTimeFormatter } from '../core/time.test';

describe('row-presenter', () => {

    const rowPresenter = new RowPresenter(utcTimeFormatter);
    const second_0 = new Date(0);
    const second_1 = new Date(1000);
    const second_3 = new Date(3000);
    const second_14 = new Date(14000);
    const somePercentPerSecond = 12345;

    test('a row at 50% progress', () => {
        const {
            flowId,
            percent,
            percentPerSecond,
            start,
            duration,
            timeSinceLastUpdate,
            timeSinceLastUpdateColor,
            remaining,
            end,
            endColorClass
        } = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_3, 50),
            {percentPerSecond: somePercentPerSecond}
        ));

        expect(flowId).toEqual('flowId');
        expect(percentPerSecond).toEqual(`${somePercentPerSecond}%`)
        expect(percent).toEqual('50%');
        expect(start).toEqual('24:00:00');
        expect(duration).toEqual('00:00:03');
        expect(timeSinceLastUpdate).toEqual('00:00:00');
        expect(timeSinceLastUpdateColor).toEqual('');
        expect(remaining).toEqual('00:00:03');
        expect(end).toEqual('24:00:06');
        expect(endColorClass).toEqual('dim');
    });

    test('a row at 1% progress who\'s update is late', () => {
        const {
            flowId,
            percent,
            percentPerSecond,
            start,
            duration,
            timeSinceLastUpdate,
            timeSinceLastUpdateColor,
            remaining,
            end,
            endColorClass
        } = rowPresenter.toRow(new FlowProgress(
            'flowId',
            Progress.create(second_0, second_14, 1, second_1),
            {percentPerSecond: somePercentPerSecond}
        ));

        expect(flowId).toEqual('flowId');
        expect(percentPerSecond).toEqual(`${somePercentPerSecond}%`)
        expect(percent).toEqual('1%');
        expect(start).toEqual('24:00:00');
        expect(duration).toEqual('00:00:14');
        expect(timeSinceLastUpdate).toEqual('00:00:13');
        expect(timeSinceLastUpdateColor).toEqual('orange');
        expect(remaining).toEqual('00:01:26');
        expect(end).toEqual('24:01:40');
        expect(endColorClass).toEqual('dim');
    });
});
