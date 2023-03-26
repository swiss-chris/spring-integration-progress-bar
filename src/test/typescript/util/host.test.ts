import { describe, test, expect, vi } from 'vitest';
import { getBackendUrl } from 'main-typescript/util';

describe('getBackendUrl', () => {
    test('should return the backend URL', () => {
        vi.stubGlobal('window', vi.fn());
        window.location = {...window.location, href: 'https://www.example.com:123'};
        vi.stubEnv('BACKEND_PORT', '5678');

        expect(getBackendUrl()).toEqual('https://www.example.com:5678');
    });
});

