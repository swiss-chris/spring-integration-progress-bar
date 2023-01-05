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
        this.#rowsMap.set(flowId, new Row(flowId, start, sources, categories, percent));
        if (!percent.isZero()) {
            this.#rowsMap.get(flowId).updateRemaining(); // on page refresh
        }
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
    #row;
    #progress;

    constructor(flowId, start, sources, categories, percent) {
        this.#row = RowCreator.createRowFromTemplate(flowId, start);
        this.#progress = new Progress(new Time(start), new Time(Date.now()), percent);
        this.#sourcesCell(sources);
        this.#categoriesCell(categories);
        this.#startCell();
    }

    updateProgress(percent) {
        this.#progress = this.#progress.copy(percent, new Time(Date.now()))
        this.#progressBarCell();
        if (this.isFlowFinished()) {
            this.#durationCell();
            this.#remainingCell();
            this.#endCell();
        }
    }

    updateRemaining() {
        this.#durationCell();
        this.#remainingCell();
        this.#endCell();
    }

    isFlowFinished() {
        return this.#progress.isFinished();
    }

    #sourcesCell(sources) {
        this.#row.querySelector('.sources').innerText = sources;
    }

    #categoriesCell(categories) {
        this.#row.querySelector('.categories').innerText = categories;
    }

    #startCell() {
        this.#row.querySelector('.start').innerText = this.#progress.start().toString();
    }

    #progressBarCell() {
        this.#row.querySelector('.progress-bar').style.width = this.#progress.percent().toString();
        this.#row.querySelector('.progress-bar').innerText = this.#progress.percent().toString();
    }

    #endCell() {
        this.#row.querySelector('.end').style.color = this.isFlowFinished() ? 'black' : 'lightgray';
        this.#row.querySelector('.end').innerText = this.#progress.end().toString();
    }

    #durationCell() {
        this.#row.querySelector('.duration').innerText = this.#progress.duration().toString();
    }

    #remainingCell() {
        this.#row.querySelector('.remaining').innerText = this.isFlowFinished() ? '' : this.#progress.remaining().toString();
    }
}

class RowCreator {
    static createRowFromTemplate(flowId, start) {
        const row = document.getElementById('progress-row').content.cloneNode(true);
        this.#setFlowId(row, flowId);
        this.#setStart(row, start);
        this.#appendInOrder(row, start);
        // we can't return 'row' as it is empty after appending
        return this.#queryBy(flowId);
    }

    static #appendInOrder(row, start) {
        const parent = this.#getParent();
        const children = this.#getChildren(parent)
        const newIndex = this.#getNewIndex(children, start);
        const nextSibling = this.#getNextSibling(children, newIndex);
        this.#insertBeforeNextSibling(nextSibling, parent, row);
    }

    static #getParent() {
        return document.getElementById('root');
    }

    static #getChildren(parent) {
        return [...parent.querySelectorAll('.flow-progress')];
    }

    static #getNewIndex(children, start) {
        const startValues = children.map(s => s.dataset.start);
        return ArrayUtils.getInsertionIndex(startValues, start, false);
    }

    static #getNextSibling(children, newIndex) {
        return (newIndex < children.length) ? children[newIndex] : null;
    }

    static #insertBeforeNextSibling(nextSibling, parent, row) {
        if (nextSibling != null) {
            parent.insertBefore(row, nextSibling);
        } else {
            parent.appendChild(row);
        }
    }

    static #setFlowId(row, flowId) {
        row.querySelector('.flow-progress').dataset.flowId = flowId;
    }

    static #setStart(row, start) {
        row.querySelector('.flow-progress').dataset.start = start;
    }

    static #queryBy(flowId) {
        return document.querySelector(`[data-flow-id="${flowId}"]`);
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
