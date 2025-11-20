document.addEventListener('DOMContentLoaded', function () {
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const checkInTime = document.getElementById('check-in-time');
    const checkOutTime = document.getElementById('check-out-time');
    const backButton = document.querySelector('.back-btn');

    const cameraStream = document.getElementById('camera-stream');
    const captureBtn = document.getElementById('capture-btn');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

    let stream;

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.srcObject = stream;
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    }

    function takePicture() {
        const context = canvas.getContext('2d');
        canvas.width = cameraStream.videoWidth;
        canvas.height = cameraStream.videoHeight;
        context.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
        photo.src = canvas.toDataURL('image/png');
        photo.style.display = 'block';
    }

    checkInBtn.addEventListener('click', function () {
        const now = new Date();
        checkInTime.textContent = `到场时间: ${now.toLocaleString()}`;
        startCamera();
    });

    checkOutBtn.addEventListener('click', function () {
        const now = new Date();
        checkOutTime.textContent = `离场时间: ${now.toLocaleString()}`;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraStream.style.display = 'none';
        captureBtn.style.display = 'none';
    });

    captureBtn.addEventListener('click', function() {
        takePicture();
    });

    backButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        window.location.href = `add_event.html?id=${eventId}&date=${date}`;
    });
});