import { FlowProgress } from './flow-progress';
import { Progress } from '../progress';

export class FlowProgressContainer {
    private flows: FlowProgress[] = [];

    constructor(flows: FlowProgress[]) {
        this.flows = flows;
    }

    updatePercent(flowId: string, start: Date, percent: number, now: Date, percentPerSecond: number): FlowProgress[] {
        // check if we already have a flow with this flowId
        const flow = this.flows.find(flow => flow.flowId() === flowId);
        if (!flow) {
            const progress = Progress.create(start, now, percent);
            this.flows.push(new FlowProgress(flowId, progress, {percentPerSecond}));
        } else {
            flow.progress().updatePercent(now, percent);
        }
        return this.flows;
    }
}
