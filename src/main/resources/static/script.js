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
        clearInterval(this.#remainingTimerId);
        this.#isActive = false;
    }
}

class RemainingUpdater {
    #rows;
    #remainingTimer = new Timer(this.#updateRemaining.bind(this));

    constructor(rows) {
        this.#rows = rows;
    }

    update() {
        if (this.#allFlowsAreFinished()) {
            this.#remainingTimer.deactivate();
        } else {
            this.#remainingTimer.keepActive();
        }
    }

    #allFlowsAreFinished() {
        return Array.from(this.#rows.values()).every(row => row.isFlowFinished());
    }

    #updateRemaining() {
        Array.from(this.#rows.values())
            .filter(row => !row.isFlowFinished())
            .forEach(row => row.updateRemaining());
    }
}

class Rows {
    static #rows = new Map();
    static #remainingUpdater = new RemainingUpdater(Rows.#rows);

    static createRow(flowId, sources, categories) {
        this.#rows.set(flowId, new Row(sources, categories));
    }

    static updateProgress({data}) {
        const {flowId, percent} = JSON.parse(data);
        Rows.#rows.get(parseInt(flowId)).updateProgress(percent);
        Rows.#remainingUpdater.update();
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
        if (this.#percent > 0) {
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
        if (this.isFlowFinished()) {
            const end = Date.now();
            this.#row.querySelector('.end').innerText = new Date(end).toLocaleTimeString();
            this.#row.querySelector('.duration').innerText = new Duration(end - this.#start).toString();
            this.#row.querySelector('.remaining').innerText = '';
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
