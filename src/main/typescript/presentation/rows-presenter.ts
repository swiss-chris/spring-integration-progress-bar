import type { RowPresentation } from './row-presentation';
import { RowPresenter } from './row-presenter';
import type { FlowProgress } from '../usecase';
import { localTimeFormatter } from '../core';

export class RowsPresenter {
    private rowPresenter: RowPresenter;

    constructor(timeFormatter: (date: Date) => string = localTimeFormatter) {
        this.rowPresenter = new RowPresenter(timeFormatter);
    }

    toSortedRows(flowProgressList: FlowProgress[]): RowPresentation[] {
        return this.sort(flowProgressList)
            .map(fp => this.rowPresenter.toRow(fp));
    }

    sort(flowProgressList: FlowProgress[]): FlowProgress[] {
        return flowProgressList
            .sort((flowA, flowB) => {
                const comparison = flowA.progress.percent
                    .compare(flowB.progress.percent);
                return comparison !== 0 ? comparison : flowB.flowId.localeCompare(flowA.flowId);
            });
    }
}
