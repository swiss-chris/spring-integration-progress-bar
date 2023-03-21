import { FlowProgress } from './flow-progress';
import { Progress } from '../progress';

export class FlowProgressContainer {
    private flows: Map<string, FlowProgress> = new Map<string, FlowProgress>();

    constructor(flows: FlowProgress[] = []) {
        for (const flow of flows) {
            this.flows.set(flow.flowId, flow);
        }
    }

    contains(flowId: string): boolean {
        return this.flows.has(flowId);
    }

    allFinished(): boolean {
        return this.getFlowsAsArray().every(flow => flow.progress.isFinished);
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

    updateTime(now: Date) {
        this.flows.forEach((flowProgress, flowId) => {
            const {progress, metadata} = this.flows.get(flowId);
            this.flows.set(flowId, new FlowProgress(flowId, progress.updateTime(now), metadata));
        })
        return this.getFlowsAsArray();
    }

    private getFlowsAsArray(): FlowProgress[] {
        return [...this.flows.values()];
    }
}
