////// -------- ON FORM SUBMIT -------- //////

class Form {
    static submit() {
        Websocket.reconnect(MessageHandler.handleMessage);
        const {startedAt, flowId, sources, categories} = this.#getParams();
        Rows.createRow(startedAt, flowId, sources, categories)
        this.#startFlow({startedAt, flowId, sources, categories});
        return false; // prevent regular form submit & page refresh
    }

    static #startFlow({startedAt, flowId, sources, categories}) {
        const queryParams = new URLSearchParams({startedAt, flowId, sources, categories});
        fetch(`flow?${queryParams}`, {method: "post"});
    }

    static #getParams() {
        const {sources, categories} = Object.fromEntries(new FormData(document.getElementById("startflow")));
        const timestamp = Date.now();
        return {
            startedAt: timestamp,
            flowId: timestamp,
            sources,
            categories
        };
    }
}

class MessageHandler {
    static handleMessage({data}) {
        const {startedAt, flowId, sources, categories, percent} = JSON.parse(data);
        Rows.updateProgress(parseInt(startedAt), parseInt(flowId), sources, categories, new Percent(percent));
    }
}

class Rows {
    static #rowsMap = new Map();

    static createRow(start, flowId, sources, categories) {
        this.#rowsMap.set(flowId, new Row(start, sources, categories));
    }

    static updateProgress(start, flowId, sources, categories, percent) {
        Rows.#createNowIfNecessary(start, flowId, sources, categories);
        Rows.#rowsMap.get(flowId).updateProgress(percent);
        remainingTimerDeActivator.update();
    }

    static allFlowsAreFinished() {
        return Rows.#rows().every(row => row.isFlowFinished());
    }

    static updateRemaining() {
        Rows.#rows().forEach(row => row.updateRemaining())
    }

    static #createNowIfNecessary(start, flowId, sources, categories) {
        // e.g. if we refresh the page during a running flow
        if (!Rows.#rowsMap.has(flowId)) {
            this.createRow(start, flowId, sources, categories);
        }
    }

    static #rows() {
        return Array.from(this.#rowsMap.values());
    }
}

class Row {
    #start;
    #percent;
    #row;

    constructor(start, sources, categories) {
        this.#start = start;
        this.#percent = new Percent(0);
        const row = this.#createRowFromTemplate(start, sources, categories);
        this.#row = this.#appendRow(row);
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

    #createRowFromTemplate(start, sources, categories) {
        const row = document.getElementById('progress-row').content.cloneNode(true);
        row.querySelector('.row-from-template').dataset.start = start;
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

////// -------- ON PAGE LOAD AND ON FORM SUBMIT -------- //////

class Websocket {
    static #URL = 'http://localhost:8080/messages';

    static #socket;

    static connect(onMessageReceived) {
        this.#socket = new SockJS(this.#URL);
        this.#socket.onmessage = onMessageReceived;
    }

    static reconnect(onMessageReceived) {
        // e.g. if the server was restarted
        if (this.#isSocketClosed()) {
            this.connect(onMessageReceived);
        }
    }

    static #isSocketClosed() {
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

////// -------- ON PAGE LOAD -------- //////

Websocket.connect(MessageHandler.handleMessage);
const remainingTimerDeActivator = new TimerDeActivator(
    Rows.allFlowsAreFinished,
    new OnOffTimer(Rows.updateRemaining)
);
