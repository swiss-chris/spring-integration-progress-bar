import {Form, MessageHandler, Rows} from './page'
import {DarkModeSwitcher} from './dark-mode';
import {OnOffTimer, TimerDeActivator, WebsocketConnector} from './lib';

////// -------- FORM -------- //////

// @ts-ignore
window.formSubmit = () => Form.submit();

////// -------- DARK MODE -------- //////

DarkModeSwitcher.initialize();

////// -------- WEB SOCKET -------- //////

export const websocketConnector = new WebsocketConnector(
    'http://localhost:8080/messages',
    MessageHandler.handleMessage,
).connect();

////// -------- TIMER -------- //////

export const remainingTimerDeActivator = new TimerDeActivator(
    Rows.allFlowsAreFinished,
    new OnOffTimer(Rows.updateRemaining),
);
