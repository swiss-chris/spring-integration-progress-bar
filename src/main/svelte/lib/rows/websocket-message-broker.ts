import { writable } from 'svelte/store'; // TODO try remove this dependency on svelte
import { getBackendUrl } from 'main-typescript/util';
import { WebsocketConnector } from 'main-typescript/util';

const { set, subscribe } = writable(undefined);

export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    ({ data }: { data: string }) => set(data)
).connect(); // on page refresh, we want to receive already running flows

export { subscribe };
