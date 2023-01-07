export const initializeDarkModeSwitcher = () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        switchColorScheme();
    });

    function switchColorScheme() {
        document.querySelector('html')!.dataset.bsTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? "dark"
            : "light";
    }

    switchColorScheme();
}
