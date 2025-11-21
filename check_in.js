
document.addEventListener('DOMContentLoaded', () => {
    const checkInOutBtn = document.getElementById('check-in-out-btn');
    const checkInOutText = document.getElementById('check-in-out-text');
    const currentTimeSpan = document.getElementById('current-time');
    const backBtn = document.getElementById('back-btn');

    const cameraStream = document.getElementById('camera-stream');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const captureBtn = document.getElementById('capture-btn');
    const photoUploadContainer = document.querySelector('.photo-upload-container');

    const historyRecordsContainer = document.getElementById('history-records');
    const noRecordsPlaceholder = document.getElementById('no-records-placeholder');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const dateParam = urlParams.get('date');
    const eventTitleParam = urlParams.get('eventTitle');

    function resolveEventContext() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const matched = events.find(e => e.id === eventId);
        const safeTitle = (matched && matched.title) || (eventTitleParam ? decodeURIComponent(eventTitleParam) : '外勤打卡');
        const safeDate = (dateParam) || (matched && matched.date) || '';
        return { matched, safeTitle, safeDate };
    }

    const { matched, safeTitle, safeDate } = resolveEventContext();
    document.getElementById('event-title').textContent = safeTitle;
    document.getElementById('event-date').textContent = safeDate;

    const type = urlParams.get('type'); // 'check-in' or 'check-out'

    let stream;

    // 根据URL参数设置初始状态
    if (type === 'check-out') {
        checkInOutText.textContent = '离场打卡';
        checkInOutBtn.classList.add('checked-in');
    } else {
        checkInOutText.textContent = '外勤打卡';
        checkInOutBtn.classList.remove('checked-in');
    }

    function takePicture() {
        if (!stream || cameraStream.style.display === 'none') {
            console.error('Camera is not active.');
            return null;
        }
        canvas.width = cameraStream.videoWidth;
        canvas.height = cameraStream.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
        const photoSrc = canvas.toDataURL('image/png');
        photo.src = photoSrc;
        photo.style.display = 'block';
        stopCamera(); // 拍照后立即停止摄像头
        return photoSrc;
    }

    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }

    function updateCurrentTime() {
        const now = new Date();
        currentTimeSpan.textContent = formatDateTime(now).split(' ')[1];
    }

    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();

    function getStorageKey() {
        return `checkInRecords_${eventId || 'unknown'}`;
    }

    function isValidRecord(r) {
        if (!r || typeof r !== 'object') return false;
        const validType = r.type === '到场打卡' || r.type === '离场打卡';
        const validTime = typeof r.time === 'string' && /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}/.test(r.time);
        return validType && validTime;
    }

    function applyButtonColorByRecords(records) {
        checkInOutBtn.classList.remove('has-records');
        if (type === 'check-out') {
            checkInOutBtn.classList.add('checked-in');
        } else {
            checkInOutBtn.classList.remove('checked-in');
            if (records.length > 0) {
                checkInOutBtn.classList.add('has-records');
            }
        }
    }

    function loadCheckInState() {
        const rawRecords = JSON.parse(localStorage.getItem(getStorageKey())) || [];
        const records = rawRecords.filter(isValidRecord);
        if (records.length > 0) {
            noRecordsPlaceholder.style.display = 'none';
            records.sort((a, b) => a.time.localeCompare(b.time));
            records.forEach(record => addHistoryRecord(record.type, record.time, record.photoSrc, false));
        }
        applyButtonColorByRecords(records);
        photoUploadContainer.style.display = 'none';
    }

    function saveHistory(records) {
        localStorage.setItem(getStorageKey(), JSON.stringify(records));
    }

    function addHistoryRecord(type, time, photoSrc, save = true) {
        noRecordsPlaceholder.style.display = 'none';
        const records = JSON.parse(localStorage.getItem(getStorageKey())) || [];

        const recordElement = document.createElement('div');
        recordElement.classList.add('history-item');

        const details = document.createElement('div');
        details.classList.add('history-details');
        details.innerHTML = `
            <p class="record-time">${time}</p>
            <p class="record-type">${type}</p>
        `;
        recordElement.appendChild(details);

        if (photoSrc) {
            const img = document.createElement('img');
            img.src = photoSrc;
            img.classList.add('history-photo');
            recordElement.appendChild(img);
        }

        historyRecordsContainer.appendChild(recordElement);

        if (save) {
            records.push({ type, time, photoSrc });
            saveHistory(records);
        }
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.srcObject = stream;
            cameraStream.style.display = 'block';
            captureBtn.style.display = 'block';
            photo.style.display = 'none';
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert('无法访问摄像头，请检查权限。');
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraStream.style.display = 'none';
        captureBtn.style.display = 'none';
    }



    checkInOutBtn.addEventListener('click', () => {
        photoUploadContainer.style.display = 'block';
        startCamera();
    });

    captureBtn.addEventListener('click', () => {
        const photoSrc = takePicture();
        if (photoSrc) {
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const baseDate = safeDate || `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const recordDateTime = new Date(`${baseDate} ${timeString}`);
            const time = formatDateTime(recordDateTime);
            const recordType = (type === 'check-out') ? '离场打卡' : '到场打卡';
            addHistoryRecord(recordType, time, photoSrc);
            const updated = (JSON.parse(localStorage.getItem(getStorageKey())) || []).filter(isValidRecord);
            applyButtonColorByRecords(updated);

            photoUploadContainer.style.display = 'none';
            stopCamera();
            photo.src = ''; 
        } else {
            alert('拍照失败，请重试。');
        }
    });

    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopCamera();
        if (safeDate) {
            window.location.href = `index.html#date=${safeDate}`;
        } else {
            window.history.back();
        }
    });

    if (eventId) {
        loadCheckInState();
    }
});
