import type { Row } from '@/presentation/row';
import { RowPresenter } from '@/presentation/row-presenter';
import type { FlowProgress } from '@/usecase/flow/flow-progress';

export class RowsPresenter {
    private rowPresenter: RowPresenter;

    constructor(timeFormatter: (date: Date) => string) {
        this.rowPresenter = new RowPresenter(timeFormatter);
    }

    toRows(flowProgressList: FlowProgress[]): Row[] {
        return flowProgressList.map(fp => this.rowPresenter.toRow(fp));
    }
}
