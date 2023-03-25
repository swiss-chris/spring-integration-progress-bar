import { FlowProgress } from './flow-progress';
import { Progress } from '../progress';
import { Subject } from 'rxjs';
import { websocketMessages } from '../websocket-message-broker';

export class FlowProgressContainer {
    private flows: Map<string, FlowProgress> = new Map<string, FlowProgress>();
    private updateReceived = new Subject<FlowProgress[]>();

    constructor(flows: FlowProgress[] = []) {
        for (const flow of flows) {
            this.flows.set(flow.flowId, flow);
        }
        websocketMessages.subscribe(({flowId, start, percent, percentPerSecond}) => {
            const flowProgresses = this._updatePercent(flowId, new Date(parseInt(start)), percent, new Date(), percentPerSecond);
            this.updateReceived.next(flowProgresses);
        })
    }

    subscribe(callback: (data: FlowProgress[]) => void) {
        this.updateReceived.subscribe(callback);
    }

    contains(flowId: string): boolean {
        return this.flows.has(flowId);
    }

    allFinished(): boolean {
        return this.getFlowsAsArray().every(flow => flow.progress.isFinished);
    }

    _updatePercent(flowId: string, start: Date, percent: number, now: Date, percentPerSecond: number): FlowProgress[] {
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
