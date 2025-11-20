document.addEventListener('DOMContentLoaded', function () {
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

    confirmDeleteButton.addEventListener('click', function () {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => event.id !== eventId);
        localStorage.setItem('events', JSON.stringify(events));
        window.location.href = `index.html?date=${date}`;
    });

    cancelDeleteButton.addEventListener('click', function () {
        window.location.href = `add_event.html?id=${eventId}`;
    });
});