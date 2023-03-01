import { writable } from 'svelte/store';
import { getBackendUrl } from '../../typescript/util/host';
import { WebsocketConnector } from '../../typescript/websocket-connector';

const { set, subscribe } = writable(undefined);

export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    ({ data }: { data: string }) => set(data)
).connect(); // on page refresh, we want to receive already running flows

export { subscribe };