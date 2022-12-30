class Flow {
    static #flowId = 0;

    static startflow() {
        const params = new URLSearchParams(new FormData(document.getElementById("startflow")));
        Rows.createRow(Flow.#flowId, params.get('sources'), params.get('categories'))
        Connection.reconnect(Rows.updateProgressForFlow);
        fetch(`flow?flowId=${Flow.#flowId}&${params}`, {method: "post"});
        Flow.#flowId++
        return false; // prevent form submit & page refresh
    }
}

class Connection {
    static #sock;
    static reconnect(onMessageReceived) {
        if (!Connection.#sock || Connection.#isSocketClosed()) {
            Connection.#connect(onMessageReceived);
        }
    }

    static #isSocketClosed() {
        return Connection.#sock.readyState === 3;
    }

    static #connect(onMessageReceived) {
        Connection.#sock = new SockJS('http://localhost:8080/messages');
        Connection.#sock.onmessage = onMessageReceived;
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
    #flowId;
    #sources;
    #categories;
    #html;

    constructor(flowId, sources, categories) {
        this.#flowId = flowId;
        this.#sources = sources;
        this.#categories = categories;
        const row = this.#createRowFromTemplate();
        document.getElementById('root').appendChild(row);
        this.#html = document.getElementById(this.#flowId);
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
        this.#html.querySelector('.progress-bar').style.width = percent + '%';
        this.#html.querySelector('.progress-bar').innerText = percent + '%';
        if (percent === 100) {
            const end = new Date();
            this.#html.querySelector('.end').innerText = end.toLocaleTimeString();
            const start = new Date(parseInt(this.#html.querySelector('.start').dataset.start));
            this.#html.querySelector('.duration').innerText = Utils.duration(end.getTime() - start.getTime());
        }
    }
}

class Utils {
    static duration(millis) {
        return new Date(millis).toISOString().substring(11, 19);
    }
}
