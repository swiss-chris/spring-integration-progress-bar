import type { FlowProgress } from '../usecase/flow/flow-progress';
import type { RowPresentation } from './row-presentation';
import { Duration, localTimeFormatter } from '../core';

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
    ): RowPresentation {
        return {
            flowId,
            percent: percent.toString(),
            percentPerSecond: `${percentPerSecond}%`,
            start: start.toString(this.timeFormatter),
            duration: duration.toString(),
            timeSinceLastUpdate: isFinished ? '' : timeSinceLastUpdate.toString(),
            timeSinceLastUpdateColor:
                isFinished ? ''
                    : this.isVeryLate(timeSinceLastUpdate) ? 'orangered'
                        : this.isLate(timeSinceLastUpdate) ? 'orange'
                            : '',
            remaining: isFinished ? '' : remaining?.toString() ?? '',
            end: end?.toString(this.timeFormatter) ?? '',
            endDim: !isFinished
        }
    }

    private isLate(timeSinceLastUpdate: Duration) {
        return timeSinceLastUpdate.isGreaterThan(Duration.ofSeconds(12));
    }

    private isVeryLate(timeSinceLastUpdate: Duration) {
        return timeSinceLastUpdate.isGreaterThan(Duration.ofSeconds(60));
    }
}
