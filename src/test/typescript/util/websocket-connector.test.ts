import { describe, test, vi, beforeEach, afterEach, expect } from 'vitest';
import { WebsocketConnector } from 'main-typescript/util';
import SockJS from 'sockjs-client/dist/sockjs';

describe('websocket-connector.ts', () => {
    const dummyUrl = 'dummy-url';

    let connector: WebsocketConnector;

    beforeEach(() => {
        // mock the 'SockJS' class
        vi.mock('sockjs-client/dist/sockjs', (original) => ({
            ...original,
            default: vi.fn(() => ({
                onmessage: vi.fn()
            }))
        }));
        connector = new WebsocketConnector(dummyUrl, vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should reconnect only if the socket is closed', () => {
        expect(SockJS).toHaveBeenCalledTimes(0);

        connector.reconnect();

        expect(SockJS).toHaveBeenCalledTimes(1);
        expect(SockJS).toHaveBeenCalledWith(dummyUrl);

        connector.reconnect();

        expect(SockJS).toHaveBeenCalledTimes(1);
    });
});
