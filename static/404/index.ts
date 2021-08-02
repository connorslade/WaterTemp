function main() {
    document.getElementById(
        'error'
    ).innerHTML = `The page <strong>${window.location.pathname}</strong> was not found... sorwy.`;
}

main();