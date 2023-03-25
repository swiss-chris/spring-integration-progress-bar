import { Subject, Subscription } from "rxjs";

export class OnOffTimer {
    private static readonly ONE_SECOND = 1000;

    private intervalId?: NodeJS.Timer;
    private isActive = false;
    private timerTick = new Subject<void>()

    subscribe(callback: () => void): Subscription {
        return this.timerTick.subscribe(callback);
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
        this.timerTick.next(); // the first time, execute immediately without waiting for timeout/interval.
        this.intervalId = setInterval(() => this.timerTick.next(), OnOffTimer.ONE_SECOND);
        this.isActive = true;
    }
}
