function isLocalhost(host: string) {
    return host.includes('localhost') || host.includes('127.0.0.1');
}

export const getHostUrl = (): string => {
    const url = new URL(window.location.href);
    const host = (url.host.split(':'))[0];
    const protocol = url.protocol;
    return `${protocol}//${host}${isLocalhost(host) ? `:${process.env.JAVA_PORT}` : ''}`;
};
