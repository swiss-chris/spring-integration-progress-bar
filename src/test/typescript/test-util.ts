import { vi } from 'vitest';

export const mockGetWSConnector = () => ({
    reconnect: vi.fn()
});
