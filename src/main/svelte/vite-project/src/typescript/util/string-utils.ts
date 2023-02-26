export function replaceAfterColon(url: string, replacement: string) {
    return url.replace(/:(.*)$/, `:${replacement}`);
}
