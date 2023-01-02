////// -------- BUSINESS-AGNOSTIC CLASSES -------- //////

class WebsocketConnector {
    #url;
    #socket;
    #onMessageReceived;

    constructor(url, onMessageReceived) {
        this.#url = url;
        this.#onMessageReceived = onMessageReceived;
        this.connect();
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

    keepActive() {
        if (!this.#isActive) {
            this.#activate();
        }
    }

    deactivate() {
        clearInterval(this.#intervalId)
        this.#isActive = false;
    }

    #activate() {
        this.#callback(); // the first time, execute immediately without waiting for timeout/interval.
        this.#intervalId = setInterval(this.#callback, this.#ONE_SECOND);
        this.#isActive = true;
    }
}

class Percent {
    static #ZERO_PERCENT = new Percent(0);
    static #ONE_HUNDRED_PERCENT = new Percent(100);

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
        return this.equals(Percent.#ZERO_PERCENT);
    }

    isOneHundred() {
        return this.equals(Percent.#ONE_HUNDRED_PERCENT);
    }

    remaining() {
        return Percent.#ONE_HUNDRED_PERCENT.minus(this);
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

class Duration {
    #millis;

    constructor(millis) {
        this.#millis = millis;
    }

    toString() {
        const s = Math.floor(this.#millis / 1000);
        return [
            this.#format(s / 60 / 60),
            this.#format(s / 60 % 60),
            this.#format(s % 60)
        ].join(':');
    }

    #format(n) {
        return (~~n).toString().padStart(2, '0')
    }
}

class ArrayUtils {
    static getNewIndex(numbers, number, ascending = true) {
        const compareFn = (a, b) => ascending ? (a - b) : (b - a);
        return numbers.concat(number).sort(compareFn).indexOf(number);
    }
}
