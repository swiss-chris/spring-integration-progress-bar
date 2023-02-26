export function replaceAfterColon(url: string, backendPort: string) {
    const [host, port] = url.split(':');
    return port ? `${host}:${backendPort}` : host;
}
