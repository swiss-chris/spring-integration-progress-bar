export class TimerDeActivator {
    private readonly deactivationPredicate;
    private onOffTimer;

    constructor(deactivationPredicate: () => boolean, onOffTimer: OnOffTimer) {
        this.deactivationPredicate = deactivationPredicate;
        this.onOffTimer = onOffTimer;
    }

    update() {
        if (this.deactivationPredicate()) {
            this.onOffTimer.deactivate();
        } else {
            this.onOffTimer.keepActive();
        }
    }
}

export class OnOffTimer {
    private static readonly ONE_SECOND = 1000;

    private readonly callback;
    private intervalId: NodeJS.Timer | undefined;
    private isActive = false;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    deactivate() {
        clearInterval(this.intervalId)
        this.isActive = false;
    }

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
