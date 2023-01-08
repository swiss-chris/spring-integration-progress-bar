import SockJS from 'sockjs-client';

////// -------- BUSINESS-AGNOSTIC CLASSES -------- //////

export class WebsocketConnector {
    private readonly url;
    private readonly onMessageReceived;
    private socket: WebSocket | undefined;

    constructor(url: string, onMessageReceived: (_: any) => void) {
        this.url = url;
        this.onMessageReceived = onMessageReceived;
    }

    connect() {
        this.socket = new SockJS(this.url);
        this.socket.onmessage = this.onMessageReceived;
        return this;
    }

    reconnect() {
        // e.g. if the server was restarted
        if (this.isSocketClosed()) {
            this.connect();
        }
    }

    private isSocketClosed() {
        return !this.socket || this.socket.readyState === 3;
    }
}

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

export class ArrayUtils {
    // returns the index where the new number should be inserted into the array to preserve sorting (ascending
    // or descending, depending on the last parameter)
    static getInsertionIndex(numbers: number[], newNumber: number, ascending = true) {
        const compareFn = (a: number, b: number) => ascending ? (a - b) : (b - a);
        return numbers.concat(newNumber).sort(compareFn).indexOf(newNumber);
    }
}
