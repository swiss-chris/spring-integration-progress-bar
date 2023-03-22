import { getBackendUrl, WebsocketConnector } from 'main-typescript/util';
import { Subject } from 'rxjs';

const websocketMessages = new Subject<string>();

let websocketConnector: WebsocketConnector | undefined;

function initializeWebsocketConnector(): { websocketConnector: WebsocketConnector; websocketMessages: Subject<string> } {
    if (!websocketConnector) {
        websocketConnector = new WebsocketConnector(
            `${getBackendUrl()}/messages`,
            ({data}: { data: string }) => websocketMessages.next(data)
        ).connect();
    }
    return { websocketConnector, websocketMessages };
}

export { initializeWebsocketConnector };
