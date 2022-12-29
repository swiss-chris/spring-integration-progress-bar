let sock;

function updateProgressForFlow(data) {
    function getRow(flowId) {
        return document.getElementById(flowId);
    }

    function createRowFromTemplate(flowId, sources, categories) {
        const row = document.getElementById('progress-row').content.cloneNode(true);
        row.querySelector('.row-from-template').id = flowId;
        row.querySelector('.sources').innerText = sources;
        row.querySelector('.categories').innerText = categories;
        return row;
    }

    function addRow(flowId, sources, categories) {
        const row = createRowFromTemplate(flowId, sources, categories);
        document.getElementById('root').appendChild(row);
        return row;
    }
    function updateProgress(row, percent) {
        row.querySelector('.progress-bar').style.width = percent + '%';
        row.querySelector('.progress-bar').innerText = percent + '%';
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
