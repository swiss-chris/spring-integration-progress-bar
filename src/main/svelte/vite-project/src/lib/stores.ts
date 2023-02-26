import { writable } from 'svelte/store';
import { getBackendUrl } from '../typescript/util/host';
import { WebsocketConnector } from '../typescript/websocket-connector';

export const messageStore = writable('');

export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    ({data}: { data: string }) => messageStore.set(data)
).connect(); // on page refresh, we want to receive already running flows