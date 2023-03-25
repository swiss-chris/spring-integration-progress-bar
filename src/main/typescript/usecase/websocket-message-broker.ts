import { getBackendUrl, WebsocketConnector } from 'main-typescript/util';
import { Subject } from 'rxjs';

export const websocketMessages = new Subject<string>();

let websocketConnector: WebsocketConnector | undefined;

export function initializeWebsocketConnector(): WebsocketConnector {
    if (!websocketConnector) {
        websocketConnector = new WebsocketConnector(
            `${getBackendUrl()}/messages`,
            ({data}: { data: string }) => websocketMessages.next(data)
        ).connect();
    }
    return websocketConnector;
}
