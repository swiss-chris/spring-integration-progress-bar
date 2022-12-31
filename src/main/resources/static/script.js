class Flow {
    static startflow() {
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
    #html;
    #start;

    constructor(flowId, sources, categories) {
        const row = this.#createRowFromTemplate(flowId, sources, categories);
        document.getElementById('root').appendChild(row);
        this.#html = document.getElementById(flowId); // TODO how can I get rid of this line and of 'flowId' for this class ?
    }

    #createRowFromTemplate(flowId, sources, categories) {
        this.#start = Date.now();
        const row = document.getElementById('progress-row').content.cloneNode(true);
        row.querySelector('.row-from-template').id = flowId;
        row.querySelector('.sources').innerText = sources;
        row.querySelector('.categories').innerText = categories;
        row.querySelector('.start').innerText = new Date(this.#start).toLocaleTimeString();
        return row;
    }

    updateProgress(percent) {
        this.#html.querySelector('.progress-bar').style.width = percent + '%';
        this.#html.querySelector('.progress-bar').innerText = percent + '%';
        if (percent === 100) {
            const end = Date.now();
            this.#html.querySelector('.end').innerText = new Date(end).toLocaleTimeString();
            this.#html.querySelector('.duration').innerText = new Duration(end - this.#start).toString();
        }
    }
}

class Duration {
    #millis;
    constructor(millis) {
        this.#millis = millis;
    }
    toString() {
        return new Date(this.#millis).toISOString().substring(11, 19);
    }
}
