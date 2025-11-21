document.addEventListener('DOMContentLoaded', function () {
    const deleteButton = document.getElementById('delete-event-btn');
    const eventTitleInput = document.getElementById('event-title');
    const eventNotesInput = document.getElementById('event-notes');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const customerLevelInput = document.getElementById('customer-level');
    const hiddenNeedsInput = document.getElementById('hidden-needs');
    const caseJudgmentInput = document.getElementById('case-judgment');
    const summaryInput = document.getElementById('summary');
    const addButton = document.getElementById('add-event-button');
    const headerTitle = document.querySelector('header span');
    const cancelButton = document.querySelector('.cancel-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

    function extractDate(dateString) {
        const match = dateString.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!match) return new Date().toISOString().slice(0, 10);
        const [, year, month, day] = match;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    if (eventId) {
        document.getElementById('page-title').textContent = '编辑日程';
        deleteButton.style.display = 'block';
        let events = JSON.parse(localStorage.getItem('events')) || [];
        const eventToEdit = events.find(e => e.id === eventId);

        if (eventToEdit) {
            eventTitleInput.value = eventToEdit.title || '';
            eventNotesInput.value = eventToEdit.notes || '';
            startDateInput.value = eventToEdit.startDate || '';
            endDateInput.value = eventToEdit.endDate || '';
            customerLevelInput.value = eventToEdit.customerLevel || '';
            hiddenNeedsInput.value = eventToEdit.hiddenNeeds || '';
            caseJudgmentInput.value = eventToEdit.caseJudgment || '';
            summaryInput.value = eventToEdit.summary || '';
        }
    } else if (date) {
        const year = date.substring(0, 4);
        const month = date.substring(5, 7);
        const day = date.substring(8, 10);
        startDateInput.value = `${year}年${month}月${day}日 上午8:30`;
        endDateInput.value = `${year}年${month}月${day}日 上午8:40`;
    }

    deleteButton.addEventListener('click', function() {
        const dateOfDeletedEvent = extractDate(startDateInput.value);
        window.location.href = `delete_confirm.html?id=${eventId}&date=${dateOfDeletedEvent}`;
    });

    document.getElementById('search-nearby-customers-btn').addEventListener('click', function() {
        const date = extractDate(startDateInput.value);
        window.location.href = `nearby_search.html?id=${eventId}&date=${date}`;
    });



    if (cancelButton) {
        cancelButton.addEventListener('click', function (event) {
            event.preventDefault();
            const date = extractDate(startDateInput.value);
            window.location.href = `index.html?date=${date}`;
        });
    }

    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Auto-resize textareas on page load and input
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        // Initial resize on page load
        if (textarea.value) {
            autoResizeTextarea(textarea);
        }

        // Resize on input
        textarea.addEventListener('input', () => {
            autoResizeTextarea(textarea);
        });
    });

    // Date parsing and formatting functions (unchanged from original)
    function parseDate(dateString) {
        const regex = /(\d{4})年(\d{1,2})月(\d{1,2})日\s*(凌晨|早上|上午|中午|下午|晚上)(\d{1,2}):(\d{2})?/;
        const match = dateString.match(regex);
        if (!match) return null;
        let [, year, month, day, period, hour, minute] = match;
        hour = parseInt(hour, 10);
        minute = minute ? parseInt(minute, 10) : 0;
        if ((period === '下午' || period === '中午' || period === '晚上') && hour < 12) hour += 12;
        if ((period === '上午' || period === '早上' || period === '凌晨') && hour === 12) hour = 0;
        return new Date(year, month - 1, day, hour, minute);
    }

    function formatScheduleDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '下午' : '上午';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${year}年${month}月${day}日 ${ampm}${hours}:${minutes}`;
    }

    function adjustAfterInsert(newEvent) {
        const bufferMs = 5 * 60 * 1000;
        let events = JSON.parse(localStorage.getItem('events')) || [];
        const dateStr = newEvent.date;
        const dayEvents = events.filter(e => e.date === dateStr);
        if (dayEvents.length < 2) return;
        dayEvents.sort((a, b) => {
            const sa = parseDate(a.startDate);
            const sb = parseDate(b.startDate);
            if (sa && sb) {
                const diff = sa - sb;
                if (diff !== 0) return diff;
                if (a.id === newEvent.id) return -1;
                if (b.id === newEvent.id) return 1;
                return 0;
            }
            return 0;
        });
        const idx = dayEvents.findIndex(e => e.id === newEvent.id);
        if (idx === -1) return;
        const durations = dayEvents.map(e => {
            const s = parseDate(e.startDate);
            const t = parseDate(e.endDate);
            return s && t ? (t.getTime() - s.getTime()) : 0;
        });
        
        for (let i = idx + 1; i < dayEvents.length; i++) {
            const prevEnd = parseDate(dayEvents[i - 1].endDate);
            if (!prevEnd) continue;
            const s = parseDate(dayEvents[i].startDate);
            const dur = durations[i];
            const minStart = new Date(prevEnd.getTime() + bufferMs);
            const useStart = s && s > minStart ? s : minStart;
            const useEnd = new Date(useStart.getTime() + dur);
            const boundaryEnd = new Date(dateStr);
            boundaryEnd.setHours(23, 59, 0, 0);
            if (dayEvents[i].allDay || dayEvents[i].fixedTime) {
                dayEvents[i].needsManual = true;
                continue;
            }
            dayEvents[i].startDate = formatScheduleDate(useStart);
            dayEvents[i].endDate = formatScheduleDate(useEnd);
            delete dayEvents[i].needsManual;
            if (useEnd > boundaryEnd) {
                const nextDay = new Date(boundaryEnd.getTime() + 60 * 1000);
                const nextDateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
                dayEvents[i].date = nextDateStr;
            }
        }
        for (let i = 0; i < dayEvents.length; i++) {
            const idxAll = events.findIndex(e => e.id === dayEvents[i].id);
            if (idxAll > -1) events[idxAll] = dayEvents[i];
        }
        localStorage.setItem('events', JSON.stringify(events));
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let hour = date.getHours();
        const minute = String(date.getMinutes()).padStart(2, '0');
        const period = hour < 12 ? '上午' : '下午';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        return `${year}年${month}月${day}日 ${period}${hour}:${minute}`;
    }

    // Auto-update end date when start date changes
    if (startDateInput) {
        startDateInput.addEventListener('input', function() {
            const startDate = parseDate(this.value);
            if (startDate) {
                const endDate = new Date(startDate.getTime() + 10 * 60000); // Add 10 minutes
                endDateInput.value = formatDate(endDate);
            }
        });
    }

    const departButtonPage = document.getElementById('depart-button-page');
    if (departButtonPage) {
        departButtonPage.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            const date = extractDate(startDateInput.value);
            window.location.href = `depart_options.html?date=${date}`;
        });
    }

    // Save button logic for both create and update
    addButton.addEventListener('click', function (event) {
        event.preventDefault();
        let events = JSON.parse(localStorage.getItem('events')) || [];

        const eventData = {
            title: eventTitleInput.value,
            notes: eventNotesInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            customerLevel: customerLevelInput.value,
            hiddenNeeds: hiddenNeedsInput.value,
            caseJudgment: caseJudgmentInput.value,
            summary: summaryInput.value,
            date: extractDate(startDateInput.value)
        };

        if (eventId) {
            // Update existing event
            const eventIndex = events.findIndex(e => e.id === eventId);
            if (eventIndex > -1) {
                events[eventIndex] = { ...events[eventIndex], ...eventData };
            }
        } else {
            // Create new event
            eventData.id = 'event-' + Date.now();
            eventData.lockStart = true;
            events.push(eventData);
        }

        localStorage.setItem('events', JSON.stringify(events));
        adjustAfterInsert(eventData);
        window.location.href = `index.html?date=${eventData.date}`;
    });
});
