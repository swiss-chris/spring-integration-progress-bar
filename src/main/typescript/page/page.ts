import { websocketConnector } from '../main';
import { Rows } from './rows';

interface StartFlowParams {
    flowId: string;
    start: number;
    percentPerSecond: number;
}

////// -------- ON FORM SUBMIT -------- //////

export class Form {
    static submit() {
        websocketConnector.reconnect();
        const {flowId, start, percentPerSecond}: StartFlowParams = this.getParams();
        Rows.createRow(flowId, new Date(start), percentPerSecond);
        this.startFlow({flowId, start, percentPerSecond});
        return false; // prevent regular form submit & page refresh
    }

    private static startFlow({start, flowId, percentPerSecond}: StartFlowParams) {
        const queryParams = new URLSearchParams({flowId, start: start.toString(), percentPerSecond: percentPerSecond.toString()});
        const toString = queryParams.toString();
        fetch(`http://localhost:${process.env.JAVA_PORT}/flow?${toString}`, {
            method: 'post',
            mode: 'no-cors'
        });
    }

    private static getParams() {
        // @ts-ignore
        const {percentPerSecond} = Object.fromEntries(new FormData(document.getElementById("startflow")));
        const timestamp = Date.now();
        return {
            start: timestamp,
            flowId: timestamp.toString(), // ideally we'd use a proper 'uuid' for 'flowId'
            percentPerSecond: parseFloat(percentPerSecond as string)
        };
    }
}

export class MessageHandler {
    static handleMessage({data}: { data: string }) {
        const {start: start, flowId, percentPerSecond, percent} = JSON.parse(data);
        Rows.updateProgress(new Date(parseInt(start)), flowId, percentPerSecond, percent);
    }
}
