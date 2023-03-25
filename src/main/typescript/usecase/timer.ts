export class OnOffTimer {
    private static readonly ONE_SECOND = 1000;

    private readonly callback;
    private intervalId?: NodeJS.Timer;
    private isActive = false;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    deactivate() {
        clearInterval(this.intervalId)
        this.isActive = false;
    }

    // TODO try to unit test all timer on/off logic in isolation
    keepActive() {
        if (!this.isActive) {
            this.activate();
        }
    }

    private activate() {
        this.callback(); // the first time, execute immediately without waiting for timeout/interval.
        this.intervalId = setInterval(this.callback, OnOffTimer.ONE_SECOND);
        this.isActive = true;
    }
}
