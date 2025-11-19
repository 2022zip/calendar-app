document.addEventListener('DOMContentLoaded', function () {
    // Get references to all form elements
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

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const date = urlParams.get('date');

    // Function to get the date part from a full date-time string
    function extractDate(dateString) {
        const match = dateString.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!match) return new Date().toISOString().slice(0, 10);
        const [, year, month, day] = match;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Load event data if editing
    if (eventId) {
        headerTitle.textContent = '编辑日程';
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
        // Set default times for new event
        const year = date.substring(0, 4);
        const month = date.substring(5, 7);
        const day = date.substring(8, 10);
        startDateInput.value = `${year}年${month}月${day}日 上午8:30`;
        endDateInput.value = `${year}年${month}月${day}日 上午8:40`;
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
        const regex = /(\d{4})年(\d{1,2})月(\d{1,2})日 (上午|下午)(\d{1,2}):(\d{2})?/;
        const match = dateString.match(regex);
        if (!match) return null;
        let [, year, month, day, period, hour, minute] = match;
        hour = parseInt(hour, 10);
        minute = minute ? parseInt(minute, 10) : 0;
        if (period === '下午' && hour < 12) hour += 12;
        if (period === '上午' && hour === 12) hour = 0;
        return new Date(year, month - 1, day, hour, minute);
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
            events.push(eventData);
        }

        localStorage.setItem('events', JSON.stringify(events));
        window.location.href = `index.html?date=${eventData.date}`;
    });
});