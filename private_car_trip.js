document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');

    const endButton = document.querySelector('.end-link');
    if (endButton) {
        endButton.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = `trip_end.html?date=${date}`;
        });
    }
});