import { Subject, Subscription } from "rxjs";

export class OnOffTimer {
    private static readonly ONE_SECOND = 1000;

    private intervalId?: number;
    private isActive = false;
    private timerTick = new Subject<void>()
    private readonly interval: number;
    
    constructor(interval = OnOffTimer.ONE_SECOND) {
        this.interval = interval;
    }

    subscribe(callback: () => void): Subscription {
        return this.timerTick.subscribe(callback);
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
        this.timerTick.next(); // the first time, execute immediately without waiting for timeout/interval.
        this.intervalId = setInterval(() => this.timerTick.next(), this.interval) as unknown as number;
        this.isActive = true;
    }
}
