////// -------- BUSINESS-AGNOSTIC CLASSES -------- //////

class WebsocketConnector {
    #url;
    #socket;
    #onMessageReceived;

    constructor(url, onMessageReceived) {
        this.#url = url;
        this.#onMessageReceived = onMessageReceived;
    }

    connect() {
        this.#socket = new SockJS(this.#url);
        this.#socket.onmessage = this.#onMessageReceived;
        return this;
    }

    reconnect() {
        // e.g. if the server was restarted
        if (this.#isSocketClosed()) {
            this.connect();
        }
    }

    #isSocketClosed() {
        return this.#socket.readyState === 3;
    }
}

class TimerDeActivator {
    #deactivationPredicate;
    #onOffTimer;

    constructor(deactivationPredicate, onOffTimer) {
        this.#deactivationPredicate = deactivationPredicate;
        this.#onOffTimer = onOffTimer;
    }

    update() {
        if (this.#deactivationPredicate()) {
            this.#onOffTimer.deactivate();
        } else {
            this.#onOffTimer.keepActive();
        }
    }
}

class OnOffTimer {
    #ONE_SECOND = 1000;

    #callback
    #intervalId;
    #isActive = false;

    constructor(callback) {
        this.#callback = callback;
    }

    deactivate() {
        clearInterval(this.#intervalId)
        this.#isActive = false;
    }

    keepActive() {
        if (!this.#isActive) {
            this.#activate();
        }
    }

    #activate() {
        this.#callback(); // the first time, execute immediately without waiting for timeout/interval.
        this.#intervalId = setInterval(this.#callback, this.#ONE_SECOND);
        this.#isActive = true;
    }
}

class Progress {
    #start;
    #now;
    #percent;

    constructor(start, now, percent) {
        this.#start = start;
        this.#now = now;
        this.#percent = percent;
    }

    copy(percent, now) {
        return new Progress(this.#start, now, percent);
    }

    isFinished() {
        return this.#percent.isOneHundred();
    }

    percent() {
        return this.#percent;
    }

    start() {
        return this.#start;
    }

    duration() {
        return this.#elapsed();
    }

    remaining() {
        return this.#remaining();
    }

    end() {
        return this.#now.plus(this.#remaining());
    }

    #elapsed() {
        return this.#start.difference(this.#now);
    }

    #remaining() {
        return this.#percent.isZero() ? undefined : this.#elapsed().times(this.#percent.remaining().divideBy(this.#percent));
    }
}

class Percent {
    static ZERO_PERCENT = new Percent(0);
    static ONE_HUNDRED_PERCENT = new Percent(100);

    #percent

    constructor(percent) {
        if (percent < 0 || percent > 100) {
            throw new Error('the parameter "percent" must be between 0 and 100');
        }
        this.#percent = percent;
    }

    equals(other) {
        return this.#percent === other.#percent;
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
        return new Percent(this.#percent - other.#percent);
    }

    divideBy(percent) {
        return this.#percent / percent.#percent;
    }

    toString() {
        return this.#percent + '%';
    }
}

class Time {
    #millis;

    constructor(millis) {
        this.#millis = millis;
    }

    plus(duration) {
        return new Time(this.#millis + duration._millis);
    }

    difference(time) {
        return new Duration(Math.abs(time.#millis - this.#millis));
    }

    toString() {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Europe/Zurich'
        }).format(new Date(this.#millis));
    }
}

class Duration {
    _millis; // access weakened (only) to allow adding Duration to Time

    constructor(millis) {
        if (millis < 0) {
            throw new Error('the parameter "millis" must be >= 0');
        }
        this._millis = millis;
    }

    times(factor) {
        return new Duration(this._millis * factor);
    }

    toString() {
        const s = Math.floor(this._millis / 1000);
        return [
            this.#format(s / 60 / 60),
            this.#format(s / 60 % 60),
            this.#format(s % 60)
        ].join(':');
    }

    #format(n) {
        return Math.floor(n).toString().padStart(2, '0')
    }
}

class ArrayUtils {
    // returns the index where the new number should be inserted into the array to preserve sorting (ascending
    // or descending, depending on the last parameter)
    static getInsertionIndex(numbers, newNumber, ascending = true) {
        const compareFn = (a, b) => ascending ? (a - b) : (b - a);
        return numbers.concat(newNumber).sort(compareFn).indexOf(newNumber);
    }
}

////// -------- JEST (TESTS) -------- //////

if (typeof module == 'undefined') { var module = {}; }
module.exports = {Progress, Percent, Time, Duration, ArrayUtils};
