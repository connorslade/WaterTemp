window.addEventListener('load', () => {
    registerSW().then();
});

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator
                .serviceWorker
                .register('/serviceworker.js');
        }
        catch (e) { }
    }
}