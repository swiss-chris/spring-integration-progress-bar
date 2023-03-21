import { getBackendUrl, WebsocketConnector } from 'main-typescript/util';
import { Subject } from 'rxjs';

const websocketMessages = new Subject();

export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    ({ data }: { data: string }) => websocketMessages.next(data)
).connect(); // on page refresh, we want to receive already running flows

export { websocketMessages };
