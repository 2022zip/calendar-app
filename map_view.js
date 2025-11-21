document.addEventListener('DOMContentLoaded', function () {
    const backButton = document.querySelector('.back-btn');
    const endTripButton = document.getElementById('end-trip-btn');
    const backToCalendarButton = document.querySelector('.back-to-calendar-btn') || endTripButton;

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

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
