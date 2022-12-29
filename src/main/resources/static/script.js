let sock;

function getRow(flowId) {
    return document.getElementById(flowId);
}

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

    const row = createRowFromTemplate(flowId, sources, categories);
    document.getElementById('root').appendChild(row);
    return getRow(flowId); // returning 'row' here causes an error later on 'row.querySelector('.progress-bar').style'
}

function updateProgressForFlow(data) {
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

    const {flowId, sources, categories, percent} = JSON.parse(data);
    const row = getRow(flowId) || addRow(flowId, sources, categories);
    updateProgress(row, percent);
}

function startflow() {
    function reconnect() {
        function connect() {
            sock = new SockJS('http://localhost:8080/messages');
            sock.onmessage = function ({data}) {
                if ('content' in document.createElement('template')) {
                    updateProgressForFlow(data);
                } else {
                    console.error("HTML Templates are not supported.");
                }
            };
        }

        const isSocketClosed = () => sock.readyState === 3;
        if (!sock || isSocketClosed()) {
            // reconnects if the server was restarted
            connect();
        }
    }

    reconnect();
    const params = new URLSearchParams(new FormData(document.getElementById("startflow")));
    fetch(`flow?${params}`, {method: "post"});
    return false; // prevent form submit & page refresh
}
