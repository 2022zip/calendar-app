document.addEventListener('DOMContentLoaded', function () {
    const backButton = document.querySelector('.back-btn');
    const endTripButton = document.getElementById('end-trip-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

    backButton.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = `add_event.html?id=${eventId}&date=${date}`;
    });

    backToCalendarButton.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = `index.html?date=${date}`;
    });
});