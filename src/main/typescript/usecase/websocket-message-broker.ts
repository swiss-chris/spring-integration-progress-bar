import { getBackendUrl, WebsocketConnector } from 'main-typescript/util';
import { Subject } from 'rxjs';

let websocketConnector: WebsocketConnector | undefined;
let websocketMessages: Subject<string> | undefined;

function initializeWebsocketConnector(): { websocketConnector: WebsocketConnector; websocketMessages: Subject<string> } {
    if (websocketConnector && websocketMessages) {
        return { websocketConnector: websocketConnector, websocketMessages: websocketMessages };
    }

    const websocketMessagesInternal = new Subject<string>();

    const websocketConnectorInternal = new WebsocketConnector(
        `${getBackendUrl()}/messages`,
        ({ data }: { data: string }) => websocketMessagesInternal.next(data)
    ).connect();

    websocketMessages = websocketMessagesInternal;
    websocketConnector = websocketConnectorInternal;

    return { websocketConnector, websocketMessages };
}

export { initializeWebsocketConnector };
