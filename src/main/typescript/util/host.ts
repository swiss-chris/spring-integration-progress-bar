import { replaceAfterColon } from './string-utils';

export const getBackendUrl = (): string => {
    const url = new URL(window.location.href);
    return `${(url.protocol)}//${(replaceAfterColon(url.host, '8080'))}`; // TODO make 8080 configurable as BACKEND_PORT
};
