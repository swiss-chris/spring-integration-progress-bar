import { Form, MessageHandler, Rows } from './page'
import { DarkModeSwitcher } from './dark-mode';
import { WebsocketConnector } from './websocket-connector';
import { OnOffTimer, TimerDeActivator } from './timer';

////// -------- FORM -------- //////

// @ts-ignore
window.formSubmit = () => Form.submit();

////// -------- DARK MODE -------- //////

DarkModeSwitcher.initialize();

////// -------- WEB SOCKET -------- //////

export const websocketConnector = new WebsocketConnector(
    `http://localhost:${process.env.PORT}/messages`,
    MessageHandler.handleMessage
).connect();

////// -------- TIMER -------- //////

export const remainingTimerDeActivator = new TimerDeActivator(
    Rows.allFlowsAreFinished,
    new OnOffTimer(Rows.updateRemaining)
);
