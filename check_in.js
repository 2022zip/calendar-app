document.addEventListener('DOMContentLoaded', function () {
    const checkInOutBtn = document.getElementById('check-in-out-btn');
    const checkInOutText = document.getElementById('check-in-out-text');
    const currentTime = document.getElementById('current-time');
    const backButton = document.querySelector('.back-btn');

    const cameraStream = document.getElementById('camera-stream');
    const captureBtn = document.getElementById('capture-btn');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const photoBox = document.querySelector('.photo-box');

    const historyRecords = document.getElementById('history-records');

    const eventTitle = document.getElementById('event-title');
    const eventDate = document.getElementById('event-date');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

    if (eventId) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        const eventToDisplay = events.find(e => e.id === eventId);
        if (eventToDisplay) {
            eventTitle.textContent = eventToDisplay.title;
        }
    }

    if (date) {
        eventDate.textContent = date;
    }

    let stream;
    let checkInState = 'in'; // 'in' or 'out'

    function updateTime() {
        const now = new Date();
        currentTime.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    async function startCamera() {
        if (stream) return;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.srcObject = stream;
            cameraStream.style.display = 'block';
            captureBtn.style.display = 'block';
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    }

    function takePicture() {
        const context = canvas.getContext('2d');
        canvas.width = cameraStream.videoWidth;
        canvas.height = cameraStream.videoHeight;
        context.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        photo.src = dataUrl;
        photo.style.display = 'block';
        return dataUrl;
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraStream.style.display = 'none';
        captureBtn.style.display = 'none';
    }

    function addHistoryRecord(type, time, photoSrc, save = true) {
        const record = document.createElement('div');
        record.classList.add('history-record');

        const timeline = document.createElement('div');
        timeline.classList.add('timeline');

        const recordContent = document.createElement('div');
        recordContent.classList.add('record-content');

        const recordType = document.createElement('p');
        recordType.textContent = type;

        const recordTime = document.createElement('p');
        recordTime.textContent = time;

        const recordPhoto = document.createElement('img');
        recordPhoto.src = photoSrc;

        recordType.classList.add(type === '到场打卡' ? 'arrival' : 'departure');
        recordContent.appendChild(recordType);
        recordContent.appendChild(recordTime);
        recordContent.appendChild(recordPhoto);

        record.appendChild(timeline);
        record.appendChild(recordContent);

        const placeholder = document.getElementById('no-records-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        historyRecords.insertBefore(record, historyRecords.firstChild);

        if (save) {
            let history = JSON.parse(localStorage.getItem('checkInHistory')) || {};
            if (!history[eventId]) {
                history[eventId] = [];
            }
            history[eventId].unshift({ type, time, photoSrc });
            localStorage.setItem('checkInHistory', JSON.stringify(history));
        }
    }

    function loadHistoryRecords() {
        let history = JSON.parse(localStorage.getItem('checkInHistory')) || {};
        if (history[eventId]) {
            const records = history[eventId];
            records.forEach(record => {
                addHistoryRecord(record.type, record.time, record.photoSrc, false);
            });
        }
    }

    checkInOutBtn.addEventListener('click', function () {
        if (checkInState === 'out') {
            checkInState = 'in';
            this.classList.add('checked-in');
            checkInOutText.textContent = '到场打卡';
            currentTime.style.display = 'block';
            startCamera();
        } else {
            startCamera();
        }
    });

    photoBox.addEventListener('click', function() {
        if (checkInState === 'in' && !stream) {
            startCamera();
        }
    });

    captureBtn.addEventListener('click', function() {
        const now = new Date();
        const timeString = now.toLocaleString();
        const arrivalRecords = historyRecords.querySelectorAll('.arrival').length;
        const departureRecords = historyRecords.querySelectorAll('.departure').length;
        let type;

        if (arrivalRecords < 3) {
            type = '到场打卡';
        } else if (departureRecords < 1) {
            type = '离场打卡';
        } else {
            // Optional: handle case where all check-ins are done
            return; // Or show a message
        }

        const photoDataUrl = takePicture();
        addHistoryRecord(type, timeString, photoDataUrl);
    });

    backButton.addEventListener('click', function (event) {
        event.preventDefault();
        stopCamera();
        window.location.href = `index.html?date=${date}`;
    });

    // Set initial state to checked-out
    checkInOutBtn.classList.remove('checked-in');
    currentTime.style.display = 'none';
    loadHistoryRecords();
    setInterval(updateTime, 1000);
});