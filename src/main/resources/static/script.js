let sock;

function updateProgressForFlow(data) {
    function getRow(flowId) {
        return document.getElementById(flowId);
    }

    function createRowFromTemplate(flowId, sources, categories) {
        const clone = document.getElementById('progress-row').content.cloneNode(true);
        clone.querySelector('.row-from-template').id = flowId;
        clone.querySelector('.sources').innerText = sources;
        clone.querySelector('.categories').innerText = categories;
        document.getElementById('root').appendChild(clone);
    }

    const {flowId, sources, categories, percent} = JSON.parse(data);
    if (!getRow(flowId)) {
        createRowFromTemplate(flowId, sources, categories);
    }
    const row = getRow(flowId);
    row.querySelector('.progress-bar').style.width = percent + '%';
    row.querySelector('.progress-bar').innerText = percent + '%';
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
