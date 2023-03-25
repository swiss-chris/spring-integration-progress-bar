import { FlowProgress } from './flow-progress';
import { Progress } from '../progress';
import { OnOffTimer } from '../timer';
import { websocketMessages, getWebsocketConnector } from '../websocket-message-broker';
import { WebsocketConnector } from '../../util';

export class FlowProgressContainer {
    private flows: Map<string, FlowProgress> = new Map<string, FlowProgress>();
    private timer: OnOffTimer;

    constructor(
        flows: FlowProgress[] = [],
        _getWebsocketConnector: () => WebsocketConnector = getWebsocketConnector
    ) {
        for (const flow of flows) {
            this.flows.set(flow.flowId, flow);
        }
        this.timer = new OnOffTimer();
        _getWebsocketConnector().reconnect();
    }

    subscribe(callback: (data: FlowProgress[]) => void) {
        const websocketMessagesSubscription = websocketMessages.subscribe(({flowId, start, percent, percentPerSecond}) => {
            const flowProgresses = this._updatePercent(flowId, new Date(parseInt(start)), percent, new Date(), percentPerSecond);
            this._resetTimer();
            callback(flowProgresses);
        });
        const timerSubscription = this.timer.subscribe(() => {
            console.log("timer tick received")
            const flowProgresses = this.updateTime(new Date());
            callback(flowProgresses);
        });
        return {
            unsubscribe: () => {
                websocketMessagesSubscription.unsubscribe();
                timerSubscription.unsubscribe();
                this.timer.deactivate();
            }
        }
    }

    _resetTimer() {
        if (this._allFinished()) {
            this.timer.deactivate();
        } else {
            this.timer.keepActive();
        }
    }

    _allFinished(): boolean {
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
