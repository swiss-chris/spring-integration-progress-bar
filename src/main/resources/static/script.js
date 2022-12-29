let sock;
let flowId = 0;

function addRow(flowId, sources, categories) {
    function createRowFromTemplate(flowId, sources, categories) {
        const row = document.getElementById('progress-row').content.cloneNode(true);
        row.querySelector('.row-from-template').id = flowId;
        row.querySelector('.sources').innerText = sources;
        row.querySelector('.categories').innerText = categories;
        const startDiv = row.querySelector('.start');
        const start = Date.now();
        startDiv.dataset.start = start;
        startDiv.innerText = new Date(start).toLocaleTimeString();
        return row;
    }

    if ('content' in document.createElement('template')) {
        const row = createRowFromTemplate(flowId, sources, categories);
        document.getElementById('root').appendChild(row);
    } else {
        console.error("HTML Templates are not supported.");
    }
}

function updateProgressForFlow({data}) {
    function getRow(flowId) {
        return document.getElementById(flowId);
    }

    function duration(millis) {
        return new Date(millis).toISOString().substring(11, 19);
    }

    function updateProgress(row, percent) {
        row.querySelector('.progress-bar').style.width = percent + '%';
        row.querySelector('.progress-bar').innerText = percent + '%';
        if (percent === 100) {
            const end = new Date();
            row.querySelector('.end').innerText = end.toLocaleTimeString();
            const start = new Date(parseInt(row.querySelector('.start').dataset.start));
            row.querySelector('.duration').innerText = duration(end.getTime() - start.getTime());
        }
    }

    const {flowId, percent} = JSON.parse(data);
    updateProgress(getRow(flowId), percent);
}

function startflow() {
    function reconnect(onMessageReceived) {
        function connect() {
            sock = new SockJS('http://localhost:8080/messages');
            sock.onmessage = onMessageReceived;
        }

        const isSocketClosed = () => sock.readyState === 3;
        if (!sock || isSocketClosed()) {
            // reconnects if the server was restarted
            connect();
        }
    }

    const params = new URLSearchParams(new FormData(document.getElementById("startflow")));
    addRow(flowId, params.get('sources'), params.get('categories'));
    reconnect(updateProgressForFlow);
    fetch(`flow?flowId=${flowId}&${params}`, {method: "post"});
    flowId++
    return false; // prevent form submit & page refresh
}
