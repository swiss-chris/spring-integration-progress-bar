import { DarkModeSwitcher } from './dark-mode';
import { WebsocketConnector } from './websocket-connector';
import { MessageHandler } from './rows';
import { Form } from './form'
import { getHostUrl } from './util/host';

////// -------- FORM -------- //////

window.onload = () => {
    const form = document.querySelector('form');
    form!.onsubmit = (e: Event) => {
        e.preventDefault();
        Form.submit();
    };
}

////// -------- DARK MODE -------- //////

DarkModeSwitcher.initialize();

////// -------- WEB SOCKET -------- //////

export const websocketConnector = new WebsocketConnector(
    `${getHostUrl()}/messages`,
    MessageHandler.handleMessage
).connect(); // on page refresh, we want to receive already running flows
