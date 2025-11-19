document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');

    const backToCalendarLink = document.getElementById('back-to-calendar-link');
    if (backToCalendarLink) {
        backToCalendarLink.href = `index.html?date=${date}`;
    }
});
