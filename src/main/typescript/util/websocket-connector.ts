import SockJS from 'sockjs-client/dist/sockjs';

// TODO unit test
export class WebsocketConnector {
    private readonly url;
    private readonly onMessageReceived;
    private socket?: WebSocket;

    constructor(url: string, onMessageReceived: (_: any) => void) {
        this.url = url;
        this.onMessageReceived = onMessageReceived;
    }

    reconnect() {
        // e.g. if the server was restarted
        if (this.isSocketClosed()) {
            this._connect();
        }
    }

    _connect() {
        this.socket = new SockJS(this.url);
        this.socket.onmessage = this.onMessageReceived;
        return this;
    }

    private isSocketClosed() {
        return !this.socket || this.socket.readyState === 3;
    }
}
