import { describe, test, expect } from 'vitest';
import { RowsPresenter } from 'main-typescript/presentation';
import { FlowProgress } from 'main-typescript/usecase/flow';
import { Progress } from 'main-typescript/usecase';
import { expectResults } from './row-presenter.test';
import { utcTimeFormatter } from '../core/time.test';

describe('rows-presenter', () => {
    const rowsPresenter = new RowsPresenter(utcTimeFormatter);

    const percentPerSecond = 12345;

    describe('toSortedRows()', () => {
        test('empty in, empty out', () => {
            const rows = rowsPresenter.toSortedRows([]);

            expect(rows).toEqual([]);
        });

        test('one row', () => {
            const rows = rowsPresenter.toSortedRows([
                new FlowProgress('flowId', Progress.create(new Date(0), new Date(1000), 50), {percentPerSecond})
            ]);

            expect(rows.length).toEqual(1);
            expectResults(rows[0],
                'flowId',
                `${percentPerSecond}%`,
                '50%',
                '24:00:00',
                '00:00:01',
                '00:00:00',
                '',
                '00:00:01',
                '24:00:02',
                true
            );
        });

        test('three rows', () => {
            const rows = rowsPresenter.toSortedRows([
                new FlowProgress('flowId3', Progress.create(new Date(0), new Date(1000), 75), {percentPerSecond}),
                new FlowProgress('flowId1', Progress.create(new Date(0), new Date(1000), 25), {percentPerSecond}),
                new FlowProgress('flowId2', Progress.create(new Date(0), new Date(1000), 50), {percentPerSecond})
            ]);

            expect(rows.length).toEqual(3);
            expect(rows[0].percent).toEqual('25%');
            expect(rows[1].percent).toEqual('50%');
            expect(rows[2].percent).toEqual('75%');
        });
    });

    describe('sort()', () => {
        test('three rows', () => {
            const sorted = rowsPresenter.sort([
                new FlowProgress('flowId2', Progress.create(new Date(0), new Date(1000), 50), {percentPerSecond}),
                new FlowProgress('flowId1', Progress.create(new Date(0), new Date(1000), 50), {percentPerSecond}),
                new FlowProgress('flowId3', Progress.create(new Date(0), new Date(1000), 50), {percentPerSecond})
            ]);

            expect(sorted.length).toEqual(3);
            expect(sorted[0].flowId).toEqual('flowId3');
            expect(sorted[1].flowId).toEqual('flowId2');
            expect(sorted[2].flowId).toEqual('flowId1');
        });
    })
});
