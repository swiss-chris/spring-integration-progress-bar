class Form {
    static submit() {
        Websocket.reconnect(MessageHandler.handleMessage);
        const {flowId, sources, categories} = this.#getParams();
        Rows.createRow(flowId, sources, categories)
        this.#startFlow({flowId, sources, categories});
        return false; // prevent regular form submit & page refresh
    }

    static #getParams() {
        const {sources, categories} = Object.fromEntries(new FormData(document.getElementById("startflow")));
        return {
            flowId: FlowId.next(),
            sources,
            categories
        };
    }

    static #startFlow({flowId, sources, categories}) {
        const queryParams = new URLSearchParams({flowId, sources, categories});
        fetch(`flow?${queryParams}`, {method: "post"});
    }
}

class FlowId {
    static #flowId = 0;

    static next() {
        return this.#flowId++;
    }
}

class Websocket {
    static #URL = 'http://localhost:8080/messages';

    static #socket;

    static reconnect(onMessageReceived) {
        if (!this.#socket || this.#isSocketClosed()) {
            this.#connect(onMessageReceived);
        }
    }

    static #isSocketClosed() {
        return this.#socket.readyState === 3;
    }

    static #connect(onMessageReceived) {
        this.#socket = new SockJS(this.#URL);
        this.#socket.onmessage = onMessageReceived;
    }
}

class MessageHandler {
    static handleMessage({data}) {
        const {flowId, percent} = JSON.parse(data);
        Rows.updateProgress(parseInt(flowId), new Percent(percent));
    }
}

class TimerDeActivator {
    #onOffTimer;
    #deactivationPredicate;

    constructor(onOffTimer, deactivationPredicate) {
        this.#onOffTimer = onOffTimer;
        this.#deactivationPredicate = deactivationPredicate;
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

    #isActive = false;
    #updateFunction
    #remainingTimerId;

    constructor(updateFunction) {
        this.#updateFunction = updateFunction;
    }

    #activate() {
        this.#updateFunction(); // the first time, execute immediately without waiting for timeout/interval.
        this.#remainingTimerId = setInterval(this.#updateFunction, this.#ONE_SECOND);
        this.#isActive = true;
    }

    keepActive() {
        if (!this.#isActive) {
            this.#activate();
        }
    }

    deactivate() {
        clearInterval(this.#remainingTimerId)
        this.#isActive = false;
    }
}

class Rows {
    static #rowsMap = new Map();
    // FIXME (ugly): not sure where else to put this timer initialization
    static #remainingTimerDeActivator = new TimerDeActivator(
        new OnOffTimer(Rows.#updateRemaining),
        Rows.#allFlowsAreFinished);

    static createRow(flowId, sources, categories) {
        this.#rowsMap.set(flowId, new Row(sources, categories));
    }

    static updateProgress(flowId, percent) {
        Rows.#rowsMap.get(flowId).updateProgress(percent);
        Rows.#remainingTimerDeActivator.update();
    }

    static #updateRemaining() {
        Rows.#rows().forEach(row => row.updateRemaining())
    }

    static #allFlowsAreFinished() {
        return Rows.#rows().every(row => row.isFlowFinished());
    }

    static #rows() {
        return Array.from(this.#rowsMap.values());
    }
}

class Row {
    #start;
    #percent;
    #row;

    constructor(sources, categories) {
        this.#start = Date.now();
        this.#percent = new Percent(0);
        const row = this.#createRowFromTemplate(sources, categories);
        this.#row = this.#appendRow(row);
    }

    #createRowFromTemplate(sources, categories) {
        const row = document.getElementById('progress-row').content.cloneNode(true);
        row.querySelector('.sources').innerText = sources;
        row.querySelector('.categories').innerText = categories;
        row.querySelector('.start').innerText = new Date(this.#start).toLocaleTimeString();
        return row;
    }

    #appendRow(row) {
        const root = document.getElementById('root');
        root.appendChild(row);
        return root.lastElementChild; // we can't use 'row' as it is empty after 'appendChild(row)'
    }

    updateProgress(percent) {
        this.#percent = percent;
        this.#row.querySelector('.progress-bar').style.width = percent.toString();
        this.#row.querySelector('.progress-bar').innerText = percent.toString();
        if (this.isFlowFinished()) {
            const end = Date.now();
            this.#row.querySelector('.end').innerText = new Date(end).toLocaleTimeString();
            this.#row.querySelector('.duration').innerText = new Duration(end - this.#start).toString();
            this.#row.querySelector('.remaining').innerText = '';
        }
    }

    updateRemaining() {
        if (this.isFlowStarted() && !this.isFlowFinished()) {
            const now = Date.now();
            const elapsed = now - this.#start;
            const remaining = elapsed * this.#percent.remaining().divideBy(this.#percent);
            this.#row.querySelector('.remaining').innerText = new Duration(remaining).toString();
        }
    }

    isFlowStarted() {
        return !this.#percent.isZero();
    }

    isFlowFinished() {
        return this.#percent.isOneHundred();
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
        const s = ~~(this.#millis / 1000);
        return this.#format(s / 3600) + ':'
            + this.#format(s % 3600 / 60) + ':'
            + this.#format(s % 60);
    }

    #format(n) {
        return (~~n).toString().padStart(2, '0')
    }
}
