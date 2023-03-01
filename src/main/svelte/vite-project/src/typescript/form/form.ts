import { websocketConnector } from '../../lib/rows/websocket-message-broker';
import { getBackendUrl } from '../util/host';

interface StartFlowParams {
    flowId: string;
    start: number;
    percentPerSecond: number
}

////// -------- ON FORM SUBMIT -------- //////

export class Form {
    static submit(percentPerSecond: number) {
        websocketConnector.reconnect();
        const {flowId, start} = this.getParams();
        this.startFlow({flowId, start, percentPerSecond});
    }

    private static startFlow({start, flowId, percentPerSecond}: StartFlowParams) {
        const queryParams = new URLSearchParams({flowId, start: start.toString(), percentPerSecond: percentPerSecond.toString()});
        const toString = queryParams.toString();
        fetch(`${getBackendUrl()}/flow?${toString}`, {
            method: 'post',
            mode: 'no-cors'
        });
    }

    private static getParams() {
        // @ts-ignore
        const timestamp = Date.now();
        return {
            start: timestamp,
            flowId: timestamp.toString(), // ideally we'd use a proper 'uuid' for 'flowId'
        };
    }
}
