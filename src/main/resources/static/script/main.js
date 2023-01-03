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

    static createRow(start, flowId, sources, categories, percent = Percent.ZERO_PERCENT) {
        this.#rowsMap.set(flowId, new Row(start, sources, categories, percent));
        this.#rowsMap.get(flowId).updateRemaining(); // in case percent > 0 we can set it immediately
    }

    static updateProgress(start, flowId, sources, categories, percent) {
        Rows.#createNowIfNecessary(start, flowId, sources, categories, percent);
        Rows.#rowsMap.get(flowId).updateProgress(percent);
        remainingTimerDeActivator.update();
    }

    static allFlowsAreFinished() {
        return Rows.#rows().every(row => row.isFlowFinished());
    }

    static updateRemaining() {
        Rows.#rows().forEach(row => row.updateRemaining())
    }

    static #createNowIfNecessary(start, flowId, sources, categories, percent) {
        // e.g. if we refresh the page during a running flow
        if (!Rows.#rowsMap.has(flowId)) {
            this.createRow(start, flowId, sources, categories, percent);
        }
    }

    static #rows() {
        return Array.from(this.#rowsMap.values());
    }
}

class Row {
    #start;
    #progress;
    #row;

    constructor(start, sources, categories, percent) {
        this.#start = start;
        this.#progress = new Progress(start, Date.now(), percent);
        const row = this.#createRowFromTemplate(start, sources, categories);
        this.#row = this.#appendRow(row);
    }

    updateProgress(percent) {
        const now = Date.now();
        this.#progress = new Progress(this.#start, now, percent);
        this.#row.querySelector('.progress-bar').style.width = this.#progress.percentAsString();
        this.#row.querySelector('.progress-bar').innerText = this.#progress.percentAsString();
        if (this.isFlowFinished()) {
            this.#row.querySelector('.end').innerText = this.#progress.currentTime();
            this.#row.querySelector('.duration').innerText = this.#progress.elapsedTime();
            this.#row.querySelector('.remaining').innerText = '';
        }
    }

    updateRemaining() {
        if (this.isFlowStarted() && !this.isFlowFinished()) {
            this.#row.querySelector('.remaining').innerText = this.#progress.remainingDuration();
        }
    }

    isFlowStarted() {
        return this.#progress.isStarted();
    }

    isFlowFinished() {
        return this.#progress.isFinished();
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
