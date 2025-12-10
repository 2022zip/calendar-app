
document.addEventListener('DOMContentLoaded', () => {
    const checkInOutBtn = document.getElementById('check-in-out-btn');
    const checkInOutText = document.getElementById('check-in-out-text');
    const currentTimeSpan = document.getElementById('current-time');
    const backBtn = document.getElementById('back-btn');
    const actionBtn = document.getElementById('action-btn');

    const cameraStream = document.getElementById('camera-stream');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const captureBtn = document.getElementById('capture-btn');
    const photoUploadContainer = document.querySelector('.photo-upload-container');

    const historyRecordsContainer = document.getElementById('history-records');
    const noRecordsPlaceholder = document.getElementById('no-records-placeholder');

    const urlParams = new URLSearchParams(window.location.search);
    let eventId = urlParams.get('eventId');
    const dateParam = urlParams.get('date');
    const eventTitleParam = urlParams.get('eventTitle');

    function resolveEventContext() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const matched = events.find(e => e.id === eventId);
        const safeTitle = (matched && matched.title) || (eventTitleParam ? decodeURIComponent(eventTitleParam) : '外勤打卡');
        
        let safeDate = (dateParam) || (matched && matched.date);
        if (!safeDate) {
            const now = new Date();
            safeDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        }
        
        return { matched, safeTitle, safeDate };
    }

    const { matched, safeTitle, safeDate } = resolveEventContext();
    document.getElementById('event-title').textContent = safeTitle;
    document.getElementById('event-date').textContent = safeDate;

    const type = urlParams.get('type'); // 'check-in' or 'check-out'
    const source = urlParams.get('source'); // 'schedule' or 'quick'
    const effectiveType = type || 'check-in';

    let stream;

    // 根据URL参数设置初始状态
    if (effectiveType === 'check-out') {
        checkInOutText.textContent = '离场打卡';
    } else {
        checkInOutText.textContent = '到场打卡';
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

    function formatScheduleDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    }

    function isDefaultCheckInTitle(title) {
        if (!title) return true;
        if (title === '外勤打卡') return true;
        if (title === '任务') return true;
        return /^\d{1,2}:\d{2}任务$/.test(title);
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

    function applyButtonColorByRecords(count) {
        checkInOutBtn.classList.toggle('has-records', count > 0);
    }

    function loadCheckInState() {
        const rawRecords = JSON.parse(localStorage.getItem(getStorageKey())) || [];
        const records = rawRecords.filter(isValidRecord);
        if (records.length > 0) {
            noRecordsPlaceholder.style.display = 'none';
            records.sort((a, b) => a.time.localeCompare(b.time));
            records.forEach(record => addHistoryRecord(record.type, record.time, record.photoSrc, false));
        }
        applyButtonColorByRecords(records.length);
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

    function parseStartForEvent(evt, baseDate) {
        const s = evt.startDate || '';
        if (typeof s === 'string') {
            let m = s.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
            if (m) {
                const y = parseInt(m[1], 10);
                const mo = parseInt(m[2], 10) - 1;
                const d = parseInt(m[3], 10);
                const h = parseInt(m[4], 10);
                const mi = parseInt(m[5], 10);
                return new Date(y, mo, d, h, mi);
            }
            m = s.match(/^(\d{1,2}):(\d{2})$/);
            if (m) {
                const h = parseInt(m[1], 10);
                const mi = parseInt(m[2], 10);
                const [yy, mm, dd] = baseDate.split('-').map(v => parseInt(v, 10));
                return new Date(yy, mm - 1, dd, h, mi);
            }
        }
        if (evt.checkInTime) {
            const m = String(evt.checkInTime).match(/^(\d{1,2}):(\d{2})$/);
            if (m) {
                const h = parseInt(m[1], 10);
                const mi = parseInt(m[2], 10);
                const [yy, mm, dd] = baseDate.split('-').map(v => parseInt(v, 10));
                return new Date(yy, mm - 1, dd, h, mi);
            }
        }
        return null;
    }

    function parseEndForEvent(evt, baseDate) {
        const s = evt.endDate || '';
        if (typeof s === 'string') {
            let m = s.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
            if (m) {
                const y = parseInt(m[1], 10);
                const mo = parseInt(m[2], 10) - 1;
                const d = parseInt(m[3], 10);
                const h = parseInt(m[4], 10);
                const mi = parseInt(m[5], 10);
                return new Date(y, mo, d, h, mi);
            }
        }
        const start = parseStartForEvent(evt, baseDate);
        if (start) return new Date(start.getTime() + 60 * 60 * 1000);
        return null;
    }

    function parseRecordDateTime(str) {
        if (typeof str !== 'string') return null;
        const m = str.match(/(\d{4})\/(\d{2})\/(\d{2})\s(\d{2}):(\d{2}):(\d{2})/);
        if (!m) return null;
        const y = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10) - 1;
        const d = parseInt(m[3], 10);
        const h = parseInt(m[4], 10);
        const mi = parseInt(m[5], 10);
        const s = parseInt(m[6], 10);
        return new Date(y, mo, d, h, mi, s);
    }

    function findNextEventId(baseDate, currentId) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const dayEvents = events.filter(e => e.date === baseDate);
        const parsed = dayEvents.map(e => ({ id: e.id, dt: parseStartForEvent(e, baseDate) }))
                               .filter(p => p.dt instanceof Date && !isNaN(p.dt));
        parsed.sort((a, b) => a.dt - b.dt);
        if (currentId) {
            const idx = parsed.findIndex(p => p.id === currentId);
            if (idx >= 0 && idx + 1 < parsed.length) return parsed[idx + 1].id;
        }
        return parsed.length > 0 ? parsed[0].id : null;
    }

    function findUrgentNextEventId(baseDate, currentId, windowMinutes) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const current = events.find(e => e.id === currentId);
        if (!current) return null;
        const ref = parseRecordDateTime(current.lastCheckOutTime) || parseEndForEvent(current, baseDate);
        if (!ref) return null;
        const cutoff = new Date(ref.getTime() + windowMinutes * 60 * 1000);
        const candidates = events.filter(e => e.date === baseDate && e.id !== currentId)
            .map(e => ({ id: e.id, dt: parseStartForEvent(e, baseDate) }))
            .filter(p => p.dt && p.dt >= ref && p.dt <= cutoff);
        candidates.sort((a, b) => a.dt - b.dt);
        return candidates.length > 0 ? candidates[0].id : null;
    }

    if (actionBtn) {
        if (effectiveType === 'check-in') {
            actionBtn.textContent = '储存任务';
            actionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let targetId = eventId;
                if (!targetId) {
                    const now = new Date();
                    const hm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
                    const startFmt = formatScheduleDate(now);
                    const endFmt = formatScheduleDate(new Date(now.getTime() + 60 * 60 * 1000));
                    const events = JSON.parse(localStorage.getItem('events')) || [];
                    targetId = `event-${Date.now()}-${Math.floor(Math.random()*10000)}`;
                    const newEvent = {
                        id: targetId,
                        title: `${hm}任务`,
                        date: safeDate,
                        startDate: startFmt,
                        endDate: endFmt,
                        type: 'check-in-record'
                    };
                    events.push(newEvent);
                    localStorage.setItem('events', JSON.stringify(events));
                    eventId = targetId;
                }
                window.location.href = `add_event.html?id=${targetId}&date=${safeDate}`;
            });
        } else {
            actionBtn.textContent = '下一个任务';
            actionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const urgentId = findUrgentNextEventId(safeDate, eventId, 30);
                if (urgentId) {
                    window.location.href = `add_event.html?id=${urgentId}&date=${safeDate}`;
                }
            });
        }
    }

    captureBtn.addEventListener('click', () => {
        const photoSrc = takePicture();
        if (photoSrc) {
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const baseDate = safeDate; 
            const recordDateTime = new Date(`${baseDate} ${timeString}`);
            const time = formatDateTime(recordDateTime);
            
            // New logic: Create or update event
            if (!eventId) {
                eventId = `event-${Date.now()}-${Math.floor(Math.random()*10000)}`;
                const endDateTime = new Date(recordDateTime.getTime() + 60 * 60 * 1000);
                const startFmt = formatScheduleDate(recordDateTime);
                const endFmt = formatScheduleDate(endDateTime);
                const startHM = `${String(recordDateTime.getHours()).padStart(2,'0')}:${String(recordDateTime.getMinutes()).padStart(2,'0')}`;
                
                const newEvent = {
                    id: eventId,
                    title: `${startHM}任务`,
                    date: baseDate,
                    startDate: startFmt,
                    endDate: endFmt,
                    type: 'check-in-record',
                    checkInTime: startHM,
                    firstCheckInTime: time,
                    hasCheckIn: true
                };
                
                const events = JSON.parse(localStorage.getItem('events')) || [];
                events.push(newEvent);
                localStorage.setItem('events', JSON.stringify(events));
            } else {
                const events = JSON.parse(localStorage.getItem('events')) || [];
                const evtIndex = events.findIndex(e => e.id === eventId);
                if (evtIndex >= 0) {
                    const evt = events[evtIndex];
                    if (!evt.type || evt.type !== 'check-in-record') {
                         evt.type = 'check-in-record';
                    }
                    if (type === 'check-out') {
                        evt.checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                        evt.lastCheckOutTime = time;
                        evt.hasCheckOut = true;
                    } else {
                        if (!evt.hasCheckIn) {
                           const hm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                           if (isDefaultCheckInTitle(evt.title)) {
                               evt.title = `${hm}任务`;
                           }
                           evt.checkInTime = hm;
                           evt.firstCheckInTime = time;
                           evt.hasCheckIn = true;
                        }
                    }
                    events[evtIndex] = evt;
                    localStorage.setItem('events', JSON.stringify(events));
                }
            }

            const recordType = (effectiveType === 'check-out') ? '离场打卡' : '到场打卡';
            addHistoryRecord(recordType, time, photoSrc);
            const updated = JSON.parse(localStorage.getItem(getStorageKey())) || [];
            const validUpdated = updated.filter(isValidRecord);
            applyButtonColorByRecords(validUpdated.length);

            photoUploadContainer.style.display = 'none';
            stopCamera();
            photo.src = ''; 
            
            // Optional: Alert user or redirect?
            // For now, keep on page as user might want to see history
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
