class Form {
    static submit() {
        const flowId = FlowId.next();
        const params = new URLSearchParams(new FormData(document.getElementById("startflow")));
        Rows.createRow(flowId, params.get('sources'), params.get('categories'))
        Connection.reconnect(Rows.updateProgress);
        fetch(`flow?flowId=${flowId}&${params}`, {method: "post"});
        return false; // prevent form submit & page refresh
    }
}

class FlowId {
    static #flowId = 0;

    static next() {
        return this.#flowId++;
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
        this.keepActive();
    }

    keepActive() {
        if (!this.#isActive) {
            this.#remainingTimerId = setInterval(this.#updateFunction, this.#ONE_SECOND);
            this.#isActive = true;
        }
    }

    deactivate() {
        setTimeout(() => {
            clearInterval(this.#remainingTimerId)
            this.#isActive = false;
        }, this.#ONE_SECOND);
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

    static updateProgress({data}) {
        const {flowId, percent} = JSON.parse(data);
        Rows.#rowsMap.get(parseInt(flowId)).updateProgress(percent);
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
    #row;
    #percent = 0;
    static #ONE_HUNDRED = 100;

    constructor(sources, categories) {
        this.#start = Date.now();
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
        if (this.#percent === 0 || this.#percent === Row.#ONE_HUNDRED) {
            this.#row.querySelector('.remaining').innerText = '';
        } else {
            const now = Date.now();
            const elapsed = now - this.#start;
            const remaining = elapsed * (Row.#ONE_HUNDRED - this.#percent) / this.#percent;
            this.#row.querySelector('.remaining').innerText = new Duration(remaining).toString();
        }
    }

    updateProgress(percent) {
        this.#percent = percent;
        this.#row.querySelector('.progress-bar').style.width = percent + '%';
        this.#row.querySelector('.progress-bar').innerText = percent + '%';
        if (percent === Row.#ONE_HUNDRED) {
            const end = Date.now();
            this.#row.querySelector('.end').innerText = new Date(end).toLocaleTimeString();
            this.#row.querySelector('.duration').innerText = new Duration(end - this.#start).toString();
        }
    }

    isFlowFinished() {
        return this.#percent === Row.#ONE_HUNDRED;
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

class Connection {
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
        this.#socket = new SockJS('http://localhost:8080/messages');
        this.#socket.onmessage = onMessageReceived;
    }
}
