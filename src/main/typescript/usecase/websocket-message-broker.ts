import { getBackendUrl, WebsocketConnector } from 'main-typescript/util';
import { Subject } from 'rxjs';

interface WebsocketMessage {
    flowId: string,
    start: string,
    percent: number,
    percentPerSecond: number
}

export const websocketMessages = new Subject<WebsocketMessage>();

let websocketConnector: WebsocketConnector | undefined;

export function initializeWebsocketConnector(): WebsocketConnector {
    if (!websocketConnector) {
        websocketConnector = new WebsocketConnector(
            `${getBackendUrl()}/messages`,
            ({data}: { data: string }) => websocketMessages.next(JSON.parse(data))
        ).connect();
    }
    return websocketConnector;
}
