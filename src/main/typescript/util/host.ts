import { replaceAfterColon } from './string-utils';

export const getBackendUrl = (): string => {
    const url = new URL(window.location.href);
    return `${(url.protocol)}//${(replaceAfterColon(url.host, process.env.JAVA_PORT!))}`;
};
