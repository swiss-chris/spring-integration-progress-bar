class Form {
    static submit() {
        const {flowId, sources, categories} = this.#getParams();
        Rows.createRow(flowId, sources, categories)
        this.#startFlow({flowId, sources, categories});
        return false; // prevent regular form submit & page refresh
    }

    static #getParams() {
        const formProps = Object.fromEntries(new FormData(document.getElementById("startflow")));
        return {
            flowId: FlowId.next(),
            sources: formProps.sources,
            categories: formProps.categories
        };
    }

    static #startFlow({flowId, sources, categories}) {
        Websocket.reconnect(MessageHandler.handleMessage);
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
    static handleMessage({data: {flowId, percent}}) {
        Rows.updateProgress(parseInt(flowId), new Percent(percent));
    }
}

class TimerRefresher {
    #timer;
    #deactivationPredicate;

    constructor(timer, deactivationPredicate) {
        this.#timer = timer;
        this.#deactivationPredicate = deactivationPredicate;
    }

    refreshTimer() {
        if (this.#deactivationPredicate()) {
            this.#timer.deactivate();
        } else {
            this.#timer.keepActive();
        }
    }
}

class Timer {
    #ONE_SECOND = 1000;

    #updateFunction
    #isActive = false;
    #remainingTimerId;

    constructor(updateFunction) {
        this.#updateFunction = updateFunction;
    }

    keepActive() {
        if (!this.#isActive) {
            this.#remainingTimerId = setInterval(this.#updateFunction, this.#ONE_SECOND);
            this.#isActive = true;
        }
    }

    deactivate() {
        clearInterval(this.#remainingTimerId)
        this.#isActive = false;
    }
}

class Rows {
    static #rowsMap = new Map();
    static #remainingUpdater = new TimerRefresher(
        new Timer(Rows.#updateRemaining.bind(this)),
        Rows.#allFlowsAreFinished.bind(this));

    static createRow(flowId, sources, categories) {
        this.#rowsMap.set(flowId, new Row(sources, categories));
    }

    static updateProgress(flowId, percent) {
        Rows.#rowsMap.get(flowId).updateProgress(percent);
        Rows.#remainingUpdater.refreshTimer();
    }

    static #updateRemaining() {
        this.#rows().forEach(row => row.updateRemaining())
    }

    static #allFlowsAreFinished() {
        return this.#rows().every(row => row.isFlowFinished());
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
        return root.lastElementChild; // we can't use 'row' as is empty after 'appendChild(row)'
    }

    updateRemaining() {
        if (this.isFlowStarted() && !this.isFlowFinished()) {
            const now = Date.now();
            const elapsed = now - this.#start;
            const remaining = elapsed * this.#percent.remaining().divideBy(this.#percent);
            this.#row.querySelector('.remaining').innerText = new Duration(remaining).toString();
        }
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

    isFlowStarted() {
        return !this.#percent.isZero();
    }

    isFlowFinished() {
        return this.#percent.isComplete();
    }
}

class Percent {
    static #ONE_HUNDRED = 100;

    #percent

    constructor(percent) {
        this.#percent = percent;
    }

    isZero() {
        return this.#percent === 0;
    }

    isComplete() {
        return this.#percent === Percent.#ONE_HUNDRED
    }

    remaining() {
        return new Percent(Percent.#ONE_HUNDRED - this.#percent);
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
        // FIXME only works for durations <24h
        return new Date(this.#millis).toISOString().substring(11, 19);
    }
}
