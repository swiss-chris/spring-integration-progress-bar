import type { Row } from '@/presentation/row';
import { RowPresenter } from '@/presentation/row-presenter';
import type { FlowProgress } from '@/usecase/flow/flow-progress';
import { localTimeFormatter } from '@/core';

export class RowsPresenter {
    private rowPresenter: RowPresenter;

    constructor(timeFormatter: (date: Date) => string = localTimeFormatter) {
        this.rowPresenter = new RowPresenter(timeFormatter);
    }

    toSortedRows(flowProgressList: FlowProgress[]): Row[] {
        return flowProgressList
            .sort((flowA, flowB) => flowA.progress.percent
                    .compare(flowB.progress.percent))
            .map(fp => this.rowPresenter.toRow(fp));
    }
}
