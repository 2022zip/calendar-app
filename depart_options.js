document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');

    const privateCarButton = document.querySelector('.private-car');
    if (privateCarButton) {
        privateCarButton.addEventListener('click', function () {
            window.location.href = `private_car_trip.html?date=${date}`;
        });
    }

    // Placeholder for Ctrip button logic
    const ctripButton = document.querySelector('.ctrip');
    if (ctripButton) {
        ctripButton.addEventListener('click', function () {
            window.location.href = `ctrip_trip.html?date=${date}`;
        });
    }
});