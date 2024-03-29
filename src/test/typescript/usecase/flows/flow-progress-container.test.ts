import { test, expect, describe } from 'vitest';
import { FlowProgressContainer, Progress, FlowProgress } from 'main-typescript/usecase';
import { mockGetWSConnector } from '../../test-util';

describe('flows progress container', () => {
    describe('updatePercent', () => {
        test('very first update', () => {
            // A flow needs to know it's flowID, it's progress data, and some metadata (in our case 'percentPerSecond')
            const flowId = 'flowId';
            const start = new Date(0);
            const percent = 50;
            const now = new Date(1000);
            const percentPerSecond = 10;

            const flowProgressContainer: FlowProgressContainer = new FlowProgressContainer([], mockGetWSConnector);

            const updatedFlowProgressContainer = flowProgressContainer._updatePercent(flowId, start, percent, now, percentPerSecond);

            expect(updatedFlowProgressContainer.length).toBe(1);
            expect(updatedFlowProgressContainer[0].equals(new FlowProgress(flowId, Progress.create(start, now, percent), {percentPerSecond})))
                .toBeTruthy();
        });

        test('second update, same flowId', () => {
            // A flow needs to know it's flowID, it's progress data, and some metatada (in our case 'percentPerSecond')
            const flowId = 'flowId';
            const start = new Date(0);
            const oldPercent = 50;
            const oldNow = new Date(1000);
            const percentPerSecond = 10;

            const flowProgressContainer = new FlowProgressContainer([
                new FlowProgress(flowId, Progress.create(start, oldNow, oldPercent), {percentPerSecond}),
            ], mockGetWSConnector);

            const newPercent = 75;
            const newNow = new Date(1500);
            const updatedFlowProgressContainer = flowProgressContainer._updatePercent(flowId, start, newPercent, newNow, percentPerSecond);

            expect(updatedFlowProgressContainer.length)
                .toBe(1);
            expect(updatedFlowProgressContainer[0].equals(new FlowProgress(flowId, Progress.create(start, newNow, newPercent), {percentPerSecond})))
                .toBeTruthy();
        });

        test('second update, different flowId', () => {
            // A flow needs to know it's flowID, it's progress data, and some metatada (in our case 'percentPerSecond')
            const oldFlowId = 'oldFlowId';
            const start = new Date(0);
            const oldPercent = 50;
            const oldNow = new Date(1000);
            const oldPercentPerSecond = 10;

            const flowProgressContainer = new FlowProgressContainer([
                new FlowProgress(oldFlowId, Progress.create(start, oldNow, oldPercent), {percentPerSecond: oldPercentPerSecond}),
            ], mockGetWSConnector);

            const newPercent = 75;
            const newNow = new Date(1500);
            const newFlowId = 'newFlowId';
            const newPercentPerSecond = 10;
            const updatedFlowProgressContainer = flowProgressContainer._updatePercent(newFlowId, start, newPercent, newNow, newPercentPerSecond);

            expect(updatedFlowProgressContainer.length)
                .toBe(2);
            const oldFlowProgress = updatedFlowProgressContainer.find(fp => fp.flowId === oldFlowId);
            expect(oldFlowProgress.equals(new FlowProgress(oldFlowId, Progress.create(start, oldNow, oldPercent), {percentPerSecond: oldPercentPerSecond})))
                .toBeTruthy();
            const newFlowProgress = updatedFlowProgressContainer.find(fp => fp.flowId === newFlowId);
            expect(newFlowProgress.equals(new FlowProgress(newFlowId, Progress.create(start, newNow, newPercent), {percentPerSecond: newPercentPerSecond})))
                .toBeTruthy();
        });
    });

    describe('updateTime', () => {
        test('only one ProgressFlow in container', () => {
            const flowId = 'flowId';
            const start = new Date(0);
            const percent = 50;
            const oldNow = new Date(1000);
            const percentPerSecond = 10;

            const flowProgressContainer = new FlowProgressContainer([
                new FlowProgress(flowId, Progress.create(start, oldNow, percent), {percentPerSecond}),
            ], mockGetWSConnector);

            const newNow = new Date(1500);
            const updatedFlowProgressContainer = flowProgressContainer.updateTime(newNow);

            expect(updatedFlowProgressContainer.length)
                .toEqual(1);
            expect(updatedFlowProgressContainer[0].equals(new FlowProgress(flowId, Progress.create(start, newNow, percent, oldNow), {percentPerSecond})))
                .toBeTruthy();
        });

        test('two ProgressFlows in container', () => {
            const flowId1 = 'flowId1';
            const flowId2 = 'flowId2';
            const start = new Date(0);
            const percent = 50;
            const oldNow = new Date(1000);
            const percentPerSecond = 10;

            const flowProgressContainer = new FlowProgressContainer([
                new FlowProgress(flowId1, Progress.create(start, oldNow, percent), {percentPerSecond}),
                new FlowProgress(flowId2, Progress.create(start, oldNow, percent), {percentPerSecond}),
            ], mockGetWSConnector);

            const newNow = new Date(1500);
            const updatedFlowProgressContainer = flowProgressContainer.updateTime(newNow);

            expect(updatedFlowProgressContainer.length)
                .toEqual(2);
            const flowProgress1 = updatedFlowProgressContainer.find(fp => fp.flowId === flowId1);
            expect(flowProgress1.equals(new FlowProgress(flowId1, Progress.create(start, newNow, percent, oldNow), {percentPerSecond})))
                .toBeTruthy();
            const flowProgress2 = updatedFlowProgressContainer.find(fp => fp.flowId === flowId2);
            expect(flowProgress2.equals(new FlowProgress(flowId2, Progress.create(start, newNow, percent, oldNow), {percentPerSecond})))
                .toBeTruthy();
        });
    });
})
