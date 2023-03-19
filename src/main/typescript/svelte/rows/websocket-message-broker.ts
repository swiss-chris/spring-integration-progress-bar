import { writable } from 'svelte/store'; // TODO try remove this dependency on svelte
import { getBackendUrl } from '@/util/host';
import { WebsocketConnector } from '@/util/websocket-connector';

const { set, subscribe } = writable(undefined);

export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    ({ data }: { data: string }) => set(data)
).connect(); // on page refresh, we want to receive already running flows

export { subscribe };
