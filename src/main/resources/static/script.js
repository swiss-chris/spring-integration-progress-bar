let sock;
const flowIds = [];
let latestFlowId;

const connect = () => {
    sock = new SockJS('http://localhost:8080/messages');
    sock.onmessage = function ({data}) {
        const {flowId, percent} = JSON.parse(data);
        if (!flowIds.includes(flowId)) {
            flowIds.push(flowId);
            latestFlowId = flowId;
        }
        if (flowId === latestFlowId) {
            // only show the progress of the most recently started flow
            document.getElementById('progress-bar').style.width = percent + '%';
            document.getElementById('progress-bar').innerText = percent + '%';
        }
    };
}

const reconnect = () => {
    const isSocketClosed = () => sock.readyState === 3;
    if (!sock || isSocketClosed()) {
        // reconnects if the server was restarted
        connect();
    }
}

const startflow = () => {
    reconnect();
    fetch("flow", {method: "post"});
    return false; // prevent form submit & page refresh
}
