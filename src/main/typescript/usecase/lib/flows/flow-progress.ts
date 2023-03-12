import type { Progress } from '../progress';

interface Metadata {
    percentPerSecond: number
}

/**
 * This class keep track of the progress of a particular flow
 */
export class FlowProgress {

    constructor(private _flowId: string, private _progress: Progress, private _metadata: Metadata) {}

    flowId(): string {
        return this._flowId;
    }

    progress(): Progress {
        return this._progress;
    }

    metadata(): Metadata {
        return this._metadata;
    }
}
