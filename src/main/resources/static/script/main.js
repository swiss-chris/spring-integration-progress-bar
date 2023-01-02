////// -------- ON FORM SUBMIT -------- //////

class Form {
    static submit() {
        websocketConnector.reconnect();
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
            flowId: timestamp, // ideally we'd use a proper 'uuid' for 'flowId'
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
        }
    }

    updateRemaining() {
        if (this.isFlowStarted()) {
            this.#row.querySelector('.remaining').innerText = this.isFlowFinished() ? '' : new Duration(this.#calculateRemainingTime()).toString();
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
        row.querySelector('.flow-progress').dataset.start = start;
        row.querySelector('.sources').innerText = sources;
        row.querySelector('.categories').innerText = categories;
        row.querySelector('.start').innerText = new Date(start).toLocaleTimeString();
        return row;
    }

    #appendRow(row) {
        const parent = document.getElementById('root');
        const children = [...parent.querySelectorAll('.flow-progress')]
        const newIndex = ArrayUtils.getInsertionIndex(children.map(s => s.dataset.start), this.#start, false);
        if (newIndex < children.length) {
            parent.insertBefore(row, children[newIndex]);
        } else {
            parent.appendChild(row);
        }
        // we can't return 'row' as it is empty after 'appendChild(row)'/'insertBefore(row)'
        return parent.querySelector(`[data-start="${this.#start}"]`);
    }

    #calculateRemainingTime() {
        const now = Date.now();
        const elapsed = now - this.#start;
        return elapsed * this.#percent.remaining().divideBy(this.#percent);
    }
}

////// -------- ON PAGE LOAD -------- //////

const websocketConnector = new WebsocketConnector(
    'http://localhost:8080/messages',
    MessageHandler.handleMessage
).connect();

const remainingTimerDeActivator = new TimerDeActivator(
    Rows.allFlowsAreFinished,
    new OnOffTimer(Rows.updateRemaining)
);
