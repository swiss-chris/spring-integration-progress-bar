let sock;
let flowId = 0;
const rows = [];

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
    rows.push(new Row(flowId, params.get('sources'), params.get('categories')));
    reconnect(Row.updateProgressForFlow);
    fetch(`flow?flowId=${flowId}&${params}`, {method: "post"});
    flowId++
    return false; // prevent form submit & page refresh
}
