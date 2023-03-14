import { describe, test, expect } from 'vitest';
import { RowPresenter } from '@/presentation/row-presenter';
import { FlowProgress } from '@/usecase/flow/flow-progress';
import { Progress } from '@/usecase/progress';
import { utcTimeFormatter } from '../core/time.test';

describe('row-presenter', () => {
    test('asdf', () => {
        // receive back a list of flowProgressRows
        const expectedFlowId = 'expectedFlowId';
        const rowPresenter = new RowPresenter(utcTimeFormatter);
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
            expectedFlowId,
            Progress.create(new Date(0), new Date(3000), 50),
            {percentPerSecond: 10}
        ));

        expect(flowId).toEqual(expectedFlowId);
        expect(percentPerSecond).toEqual('10%')
        expect(percent).toEqual('50%');
        expect(start).toEqual('24:00:00');
        expect(duration).toEqual('00:00:03');
        expect(timeSinceLastUpdate).toEqual('00:00:00');
        expect(timeSinceLastUpdateColor).toEqual('');
        expect(remaining).toEqual('00:00:03');
        expect(end).toEqual('24:00:06');
        expect(endColorClass).toEqual('dim');
    })
});
