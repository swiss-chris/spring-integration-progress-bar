import { test, expect, describe } from 'vitest';
import { FlowProgressContainer } from '../../../../../main/typescript/usecase/lib/flows/flow-progress-container';
import { Progress } from '../../../../../main/typescript/usecase/lib/progress';
import { FlowProgress } from '../../../../../main/typescript/usecase/lib/flows/flow-progress';

describe('flows', () => {
    test('very first update', () => {
        // the Flows object contains the list of all started (and known finished) Flow objects.
        const flowProgressContainer: FlowProgressContainer = new FlowProgressContainer([]);

        // A flow needs to know it's flowID, it's progress data, and some metatada (in our case 'percentPerSecond')
        const flowId = 'flowId';
        const start = new Date(0);
        const percent = 50;
        const now = new Date(1000);
        const percentPerSecond = 10;

        const updatedFlowProgressContainer = flowProgressContainer.updatePercent(flowId, start, percent, now, percentPerSecond);

        expect(updatedFlowProgressContainer.length).toBe(1);
        expect(updatedFlowProgressContainer[0].flowId).toEqual(flowId);
        expect(updatedFlowProgressContainer[0].progress.equals(Progress.create(start, now, percent)));
    })

    test('second update, same flowId', () => {
        // A flow needs to know it's flowID, it's progress data, and some metatada (in our case 'percentPerSecond')
        const flowId = 'flowId';
        const start = new Date(0);
        const oldPercent = 50;
        const oldNow = new Date(1000);
        const percentPerSecond = 10;

        const flowProgressContainer = new FlowProgressContainer([
            new FlowProgress(flowId, Progress.create(start, oldNow, oldPercent), {percentPerSecond})
        ]);

        const newPercent = 75;
        const newNow = new Date(1500);
        const updatedFlowProgressContainer = flowProgressContainer.updatePercent(flowId, start, newPercent, newNow, percentPerSecond);

        expect(updatedFlowProgressContainer.length)
            .toBe(1);
        const updatedFlowProgress = updatedFlowProgressContainer[0];
        expect(updatedFlowProgress.flowId)
            .toEqual(flowId);
        expect(updatedFlowProgress.progress.equals(Progress.create(start, newNow, newPercent)))
            .toBeTruthy();
    })
})
