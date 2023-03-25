import type { RowPresentation } from './row-presentation';
import { RowPresenter } from './row-presenter';
import type { FlowProgress } from '../usecase';
import { FlowProgressContainer } from '../usecase';
import { localTimeFormatter } from '../core';
import { Subject } from 'rxjs';

export class RowsPresenter {
    private rowPresenter: RowPresenter;
    private flowProgressContainer: FlowProgressContainer;
    private updateReceived = new Subject<RowPresentation[]>()

    constructor(timeFormatter: (date: Date) => string = localTimeFormatter) {
        this.rowPresenter = new RowPresenter(timeFormatter);
        this.flowProgressContainer = new FlowProgressContainer();
        this.flowProgressContainer.subscribe((data: FlowProgress[]) => this.updateReceived.next(this._toSortedRows(data)))
    }

    subscribe(callback: (data: RowPresentation[]) => void) {
        this.updateReceived.subscribe(callback);
    }

    _toSortedRows(flowProgressList: FlowProgress[]): RowPresentation[] {
        return this._sort(flowProgressList)
            .map(fp => this.rowPresenter.toRow(fp));
    }

    _sort(flowProgressList: FlowProgress[]): FlowProgress[] {
        return flowProgressList
            .sort((flowA, flowB) => {
                const comparison = flowA.progress.percent
                    .compare(flowB.progress.percent);
                return comparison !== 0 ? comparison : flowB.flowId.localeCompare(flowA.flowId);
            });
    }
}
