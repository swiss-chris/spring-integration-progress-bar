class Rows {
    static #rows = new Map();

    static createRow(flowId, sources, categories) {
        Rows.#rows.set(flowId, new Row(flowId, sources, categories));
    }

    static updateProgressForFlow({data}) {
        const {flowId, percent} = JSON.parse(data);
        const row = Rows.#rows.get(parseInt(flowId));
        row.updateProgress(percent);
    }
}

class Row {
    #flowId;
    #sources;
    #categories;

    constructor(flowId, sources, categories) {
        this.#flowId = flowId;
        this.#sources = sources;
        this.#categories = categories;
        const row = this.#createRowFromTemplate();
        document.getElementById('root').appendChild(row);
    }

    #createRowFromTemplate() {
        const row = document.getElementById('progress-row').content.cloneNode(true);
        row.querySelector('.row-from-template').id = this.#flowId;
        row.querySelector('.sources').innerText = this.#sources;
        row.querySelector('.categories').innerText = this.#categories;
        const startDiv = row.querySelector('.start');
        const start = Date.now();
        startDiv.dataset.start = start.toString();
        startDiv.innerText = new Date(start).toLocaleTimeString();
        return row;
    }

    updateProgress(percent) {
        const row = this.getRow();
        row.querySelector('.progress-bar').style.width = percent + '%';
        row.querySelector('.progress-bar').innerText = percent + '%';
        if (percent === 100) {
            const end = new Date();
            row.querySelector('.end').innerText = end.toLocaleTimeString();
            const start = new Date(parseInt(row.querySelector('.start').dataset.start));
            row.querySelector('.duration').innerText = duration(end.getTime() - start.getTime());
        }
    }

    // can we save this in a local private field?
    getRow() {
        return document.getElementById(this.#flowId);
    }
}

function duration(millis) {
    return new Date(millis).toISOString().substring(11, 19);
}
