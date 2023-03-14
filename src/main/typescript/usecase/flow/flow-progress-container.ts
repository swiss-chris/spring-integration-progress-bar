import { FlowProgress } from './flow-progress';
import { Progress } from '../progress';

export class FlowProgressContainer {
    private flows: Map<string, FlowProgress> = new Map<string, FlowProgress>();

    constructor(flows: FlowProgress[]) {
        for (const flow of flows) {
            this.flows.set(flow.flowId, flow);
        }
    }

    updatePercent(flowId: string, start: Date, percent: number, now: Date, percentPerSecond: number): FlowProgress[] {
        // check if we already have a flow with this flowId
        const flow = this.flows.get(flowId);
        if (!flow) {
            const progress = Progress.create(start, now, percent);
            this.flows.set(flowId, new FlowProgress(flowId, progress, {percentPerSecond}));
        } else {
            this.flows.set(flowId, new FlowProgress(flowId, flow.progress.updatePercent(now, percent), {percentPerSecond}))
        }
        return this.getFlowsAsArray();
    }

    updateTime(flowId: string, now: Date) {
        const flow = this.flows.get(flowId);
        this.flows.set(flowId, new FlowProgress(flowId, flow.progress.updateTime(now), flow.metadata));
        return this.getFlowsAsArray();
    }

    private getFlowsAsArray() {
        return [...this.flows.values()];
    }
}
