import { WebsocketConnector } from './websocket-connector';
import { MessageHandler } from './rows';
import { getBackendUrl } from './util/host';

////// -------- WEB SOCKET -------- //////

export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    MessageHandler.handleMessage
); // on page refresh, we want to receive already running flows
