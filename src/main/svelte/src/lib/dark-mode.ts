export class DarkModeSwitcher {
    static initialize() {
        this.listenForChanges();
        this.switchColorScheme();
    }

    static listenForChanges() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.switchColorScheme();
        });
    }

    static switchColorScheme() {
        document.querySelector('html')!.dataset.bsTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? "dark"
            : "light";
    }
}
