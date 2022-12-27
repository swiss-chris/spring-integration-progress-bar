let sock;
const flowIds = [];
let latestFlowId;

const connect = () => {
    sock = new SockJS('http://localhost:8080/messages')
}

const reconnect = () => {
    if (sock.readyState === 3) {
        connect();
    }

    sock.onmessage = function ({data}) {
        const {flowId, percent} = JSON.parse(data);
        if (!flowIds.includes(flowId)) {
            flowIds.push(flowId);
            latestFlowId = flowId;
        }
        if (flowId === latestFlowId) {
            document.getElementById('progress-bar').style.width = percent + '%';
            document.getElementById('progress-bar').innerText = percent + '%';
        }
    };
}

const startflow = () => {
    reconnect();
    fetch("flow", {method: "post"});
    return false; // prevent form submit & page refresh
}

connect();
