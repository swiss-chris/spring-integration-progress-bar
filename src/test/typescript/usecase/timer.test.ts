import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { OnOffTimer } from 'main-typescript/usecase/timer';

describe('OnOffTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should execute callback x seconds', () => {
        const timer = new OnOffTimer(10);
        const callback = vi.fn();
        const subscription = timer.subscribe(callback)

        expect(callback).toHaveBeenCalledTimes(0);

        timer.keepActive();
        expect(callback).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(10);
        expect(callback).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(10);
        expect(callback).toHaveBeenCalledTimes(3);

        subscription.unsubscribe();

        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(3);

        timer.subscribe(callback);
        expect(callback).toHaveBeenCalledTimes(3);

        vi.advanceTimersByTime(10);
        expect(callback).toHaveBeenCalledTimes(4);

        timer.deactivate();
        expect(callback).toHaveBeenCalledTimes(4);
    });
})


