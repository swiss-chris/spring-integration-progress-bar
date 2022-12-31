class Form {
    static submit() {
        const flowId = FlowId.next();
        const params = new URLSearchParams(new FormData(document.getElementById("startflow")));
        Rows.createRow(flowId, params.get('sources'), params.get('categories'))
        Connection.reconnect(Rows.updateProgressForFlow);
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

class Rows {
    static #rows = new Map();
    static #intervalId;
    static #ONE_SECOND = 1000;

    static createRow(flowId, sources, categories) {
        this.#rows.set(flowId, new Row(sources, categories));
        this.#resetInterval();
    }

    static updateProgressForFlow({data}) {
        const {flowId, percent} = JSON.parse(data);
        const row = Rows.#rows.get(parseInt(flowId));
        row.updateProgress(percent);
        if (Array.from(Rows.#rows.values()).every(row => row.isFinished())) {
            clearInterval(Rows.#intervalId);
        }
    }

    static #resetInterval() {
        clearInterval(this.#intervalId);
        this.#intervalId = setInterval(this.#updateRemaining, this.#ONE_SECOND);
    }

    static #updateRemaining() {
        Array.from(Rows.#rows.values())
            .filter(row => !row.isFinished())
            .forEach(row => row.updateRemaining());
    }
}

class Row {
    #start;
    #row;
    #percent = 0;

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
            const remaining = elapsed * (100 - this.#percent) / this.#percent;
            const duration = new Duration(remaining);
            this.#row.querySelector('.remaining').innerText = duration.toString();
        }
    }

    updateProgress(percent) {
        this.#percent = percent;
        this.#row.querySelector('.progress-bar').style.width = percent + '%';
        this.#row.querySelector('.progress-bar').innerText = percent + '%';
        if (this.isFinished()) {
            const end = Date.now();
            this.#row.querySelector('.end').innerText = new Date(end).toLocaleTimeString();
            this.#row.querySelector('.duration').innerText = new Duration(end - this.#start).toString();
            this.#row.querySelector('.remaining').innerText = '';
        }
    }

    isFinished() {
        return this.#percent === 100;
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
