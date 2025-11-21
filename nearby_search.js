document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const backToCalendarLink = document.getElementById('back-to-calendar-link');
    if (backToCalendarLink && date) {
        backToCalendarLink.href = `index.html?date=${date}`;
    }
    const mapImage = document.getElementById('mapImage');
    if (mapImage) { mapImage.src = 'images/Map%20CC.png'; }
});
