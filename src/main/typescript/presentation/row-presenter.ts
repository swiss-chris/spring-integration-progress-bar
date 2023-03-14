import type { FlowProgress } from '@/usecase/flow/flow-progress';
import type { Row } from '@/presentation/row';
import { Duration, localTimeFormatter } from '@/core';

export class RowPresenter {
    private timeFormatter: (date: Date) => string;

    constructor(
        timeFormatter?: (date: Date) => string
    ) {
        this.timeFormatter = timeFormatter ?? localTimeFormatter;
    }

    toRow(
        {
            flowId,
            progress: {percent, start, duration, timeSinceLastUpdate, remaining, end, isFinished},
            metadata: {percentPerSecond}
        }: FlowProgress
    ): Row {
        return {
            flowId,
            percent: percent.toString(),
            percentPerSecond: `${percentPerSecond}%`,
            start: start.toString(this.timeFormatter),
            duration: duration.toString(),
            timeSinceLastUpdate: timeSinceLastUpdate.toString(),
            timeSinceLastUpdateColor:
                this.isLate(timeSinceLastUpdate) ? 'orange'
                    : this.isVeryLate(timeSinceLastUpdate) ? 'orangered' : '',
            remaining: remaining?.toString(),
            end: end?.toString(this.timeFormatter),
            endColorClass: isFinished ? '' : 'dim'
        }
    }

    private isLate(timeSinceLastUpdate: Duration) {
        return timeSinceLastUpdate.isGreaterThan(Duration.ofSeconds(12));
    }

    private isVeryLate(timeSinceLastUpdate: Duration) {
        return timeSinceLastUpdate.isGreaterThan(Duration.ofSeconds(60));
    }
}
