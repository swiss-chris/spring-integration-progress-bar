function isLocalhost(host: string) {
    return host.includes('localhost') || host.includes('127.0.0.1');
}

export const getHostUrl = (): string => {
    const url = new URL(window.location.href);
    const host = (url.host.split(':'))[0];
    const port = isLocalhost(host) ? process.env.JAVA_PORT! : '80';
    const protocol = url.protocol;
    return `${protocol}//${host}:${port}`;
};
