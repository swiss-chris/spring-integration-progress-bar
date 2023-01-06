import SockJS from 'sockjs-client';

////// -------- BUSINESS-AGNOSTIC CLASSES -------- //////

export class WebsocketConnector {
    private readonly url;
    private readonly onMessageReceived;
    private socket;

    constructor(url, onMessageReceived) {
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
        return this.socket.readyState === 3;
    }
}

export class TimerDeActivator {
    private readonly deactivationPredicate;
    private onOffTimer;

    constructor(deactivationPredicate, onOffTimer) {
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

    private readonly callback
    private intervalId;
    private isActive = false;

    constructor(callback) {
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

export class Progress {
    private readonly _start: Time;
    private readonly now: Time;
    private readonly _percent: Percent;

    constructor(start: Time, now: Time, percent: Percent) {
        this._start = start;
        this.now = now;
        this._percent = percent;
    }

    copy(percent: Percent, now: Time) {
        return new Progress(this._start, now, percent);
    }

    isFinished() {
        return this._percent.isOneHundred();
    }

    percent(): Percent {
        return this._percent;
    }

    start(): Time {
        return this._start;
    }

    duration(): Duration {
        return this.elapsed();
    }

    remaining(): Duration | undefined {
        return this._percent.isZero()
            ? undefined
            : this.elapsed().times(this._percent.remaining().divideBy(this._percent));
    }

    end(): Time {
        return this.now.plus(this.remaining());
    }

    private elapsed(): Duration {
        return this._start.difference(this.now);
    }
}

export class Percent {
    static ZERO_PERCENT = new Percent(0);
    static ONE_HUNDRED_PERCENT = new Percent(100);

    private readonly percent

    constructor(percent) {
        if (percent < 0 || percent > 100) {
            throw new Error('the parameter "percent" must be between 0 and 100');
        }
        this.percent = percent;
    }

    equals(other) {
        return this.percent === other.percent;
    }

    isZero() {
        return this.equals(Percent.ZERO_PERCENT);
    }

    isOneHundred() {
        return this.equals(Percent.ONE_HUNDRED_PERCENT);
    }

    remaining() {
        return Percent.ONE_HUNDRED_PERCENT.minus(this);
    }

    minus(other) {
        return new Percent(this.percent - other.percent);
    }

    divideBy(percent) {
        return this.percent / percent.percent;
    }

    toString() {
        return this.percent + '%';
    }
}

export class Time {
    private readonly millis: number;

    constructor(millis: number) {
        this.millis = millis;
    }

    plus(duration) {
        return new Time(this.millis + duration._millis);
    }

    difference(time: Time) {
        return new Duration(Math.abs(time.millis - this.millis));
    }

    toString() {
        return new Intl.DateTimeFormat('de-CH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/Zurich',
            hour12: false,
        }).format(new Date(+this.millis)); // TODO prevent millis from being a string here
    }
}

export class Duration {
    _millis: number; // access weakened (only) to allow adding Duration to Time

    constructor(millis) {
        if (millis < 0) {
            throw new Error('the parameter "millis" must be >= 0');
        }
        this._millis = millis;
    }

    times(factor: number) {
        return new Duration(this._millis * factor);
    }

    toString() {
        const s = Math.floor(this._millis / 1000);
        return [
            this.format(s / 60 / 60),
            this.format(s / 60 % 60),
            this.format(s % 60)
        ].join(':');
    }

    private format(n) {
        return Math.floor(n).toString().padStart(2, '0')
    }
}

export class ArrayUtils {
    // returns the index where the new number should be inserted into the array to preserve sorting (ascending
    // or descending, depending on the last parameter)
    static getInsertionIndex(numbers, newNumber, ascending = true) {
        const compareFn = (a, b) => ascending ? (a - b) : (b - a);
        return numbers.concat(newNumber).sort(compareFn).indexOf(newNumber);
    }
}

// ////// -------- JEST (TESTS) -------- //////
//
// if (typeof module == 'undefined') { var module = {}; }
// module.exports = {Progress, Percent, Time, Duration, ArrayUtils};
