function main() {
    if (window.location.href.indexOf('?page=') > -1) {
        var page = window.location.href.split('?')[1].split('=')[1];
        document.getElementById('error').innerHTML = "The page <strong>" + page + "</strong> was not found... sorwy.";
        return;
    }
    document.getElementById('error').innerHTML = 'The page you requested was not found... sorwy.';
}
main();
