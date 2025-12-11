document.addEventListener('DOMContentLoaded', function () {
    const backButton = document.querySelector('.back-btn');
    const endTripButton = document.getElementById('end-trip-btn');
    const backToCalendarButton = document.querySelector('.back-to-calendar-btn') || endTripButton;

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');
    const mode = urlParams.get('mode');

    const titleEl = document.querySelector('header h1');
    if (titleEl) {
        if (mode === 'didi') {
            document.title = '企业滴滴';
            titleEl.textContent = '您目前在进行企业滴滴';
        } else {
            document.title = '私车公用';
            titleEl.textContent = '您目前在进行私车公用';
        }
    }

    if (backButton) {
        backButton.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = `add_event.html?id=${eventId}&date=${date}`;
        });
    }

    if (endTripButton) {
        endTripButton.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = `index.html?date=${date}`;
        });
    }
    if (backToCalendarButton && backToCalendarButton !== endTripButton) {
        backToCalendarButton.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = `index.html?date=${date}`;
        });
    }
});
