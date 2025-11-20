document.addEventListener('DOMContentLoaded', () => {
    const yesButton = document.getElementById('yes-button');
    const noButton = document.getElementById('no-button');
    const backToCalendarLink = document.getElementById('back-to-calendar');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const date = urlParams.get('date');

    if (date) {
        backToCalendarLink.href = `index.html?date=${date}`;
    }

    yesButton.addEventListener('click', () => {
        // Redirect to the edit event page (or back to the calendar for now)
        window.location.href = `index.html?date=${date}`;
    });

    noButton.addEventListener('click', () => {
        // Go back to the calendar page with the correct date
        window.location.href = `index.html?date=${date}`;
    });
});