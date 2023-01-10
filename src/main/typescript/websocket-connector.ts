import SockJS from 'sockjs-client';

export class WebsocketConnector {
    private readonly url;
    private readonly onMessageReceived;
    private socket?: WebSocket;

    constructor(url: string, onMessageReceived: (_: any) => void) {
        this.url = url;
        this.onMessageReceived = onMessageReceived;
    }

    connect() {
        this.socket = new SockJS(this.url);
        this.socket.onmessage = this.onMessageReceived;
        return this;
    }

    reconnect() {
        // e.g. if the server was restarted
        if (this.isSocketClosed()) {
            this.connect();
        }
    }

    private isSocketClosed() {
        return !this.socket || this.socket.readyState === 3;
    }
}
