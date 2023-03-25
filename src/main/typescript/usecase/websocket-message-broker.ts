import { getBackendUrl, WebsocketConnector } from 'main-typescript/util';
import { Subject } from 'rxjs';

export interface WebsocketMessage {
    flowId: string,
    start: string,
    percent: number,
    percentPerSecond: number
}

export const websocketMessages = new Subject<WebsocketMessage>();

let websocketConnector: WebsocketConnector | undefined;

// TODO unit test this class
export function getWebsocketConnector(): WebsocketConnector {
    if (!websocketConnector) {
        websocketConnector = new WebsocketConnector(
            `${getBackendUrl()}/messages`,
            ({data}: { data: string }) => websocketMessages.next(JSON.parse(data))
        );
    }
    return websocketConnector;
}
