document.addEventListener('DOMContentLoaded', function () {
    const store = window.managerStore;
    const deleteButton = document.getElementById('delete-event-btn');
    const eventOwnerSelect = document.getElementById('event-owner');
    const eventTitleInput = document.getElementById('event-title');
    const eventNotesInput = document.getElementById('event-notes');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const customerLevelInput = document.getElementById('customer-level');
    const hiddenNeedsInput = document.getElementById('hidden-needs');
    const caseJudgmentInput = document.getElementById('case-judgment');
    const summaryInput = document.getElementById('summary');
    const addButton = document.getElementById('add-event-button');
    const cancelButton = document.querySelector('.cancel-btn');

    const urlParams = new URLSearchParams(window.location.search);
    let eventId = urlParams.get('id');
    const originDate = urlParams.get('date');

    // Populate Owner Select
    const currentUser = store.currentUser;
    const team = store.getTeamMembers();
    
    // Add Self
    const selfOpt = document.createElement('option');
    selfOpt.value = currentUser.username || 'manager';
    selfOpt.textContent = `Myself (${currentUser.username || 'manager'})`;
    eventOwnerSelect.appendChild(selfOpt);

    // Add Team
    team.forEach(member => {
        const opt = document.createElement('option');
        opt.value = member.id;
        opt.textContent = member.name;
        eventOwnerSelect.appendChild(opt);
    });

    function extractDate(dateString) {
        // Simple extraction for YYYY-MM-DD
        const d = store.parseScheduleDate(dateString);
        if (d) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        return new Date().toISOString().slice(0, 10);
    }

    if (eventId) {
        document.getElementById('page-title').textContent = 'Edit Schedule (Mgr)';
        deleteButton.style.display = 'block';
        
        const events = store.getEvents();
        const eventToEdit = events.find(e => e.id === eventId);

        if (eventToEdit) {
            eventOwnerSelect.value = eventToEdit.owner || (currentUser.username || 'manager');
            eventTitleInput.value = eventToEdit.title || '';
            eventNotesInput.value = eventToEdit.notes || '';
            
            // Format dates for input
            startDateInput.value = eventToEdit.startDate || '';
            endDateInput.value = eventToEdit.endDate || '';

            customerLevelInput.value = eventToEdit.customerLevel || '';
            hiddenNeedsInput.value = eventToEdit.hiddenNeeds || '';
            caseJudgmentInput.value = eventToEdit.caseJudgment || '';
            summaryInput.value = eventToEdit.summary || '';
        }
    } else if (originDate) {
        // Default times
        startDateInput.value = `${originDate} 08:30`;
        endDateInput.value = `${originDate} 09:30`; // Default 1 hour
    }

    deleteButton.addEventListener('click', function() {
        if (confirm('Delete this event?')) {
            store.deleteEvent(eventId);
            const dateForReturn = originDate || extractDate(startDateInput.value);
            window.location.href = `index.html?date=${dateForReturn}`;
        }
    });

    if (cancelButton) {
        cancelButton.addEventListener('click', function (event) {
            event.preventDefault();
            const dateForReturn = originDate || extractDate(startDateInput.value);
            window.location.href = `index.html?date=${dateForReturn}`;
        });
    }

    // Auto-update end date logic (simplified)
    startDateInput.addEventListener('change', function() {
        // In a real app, parse and add duration
    });

    addButton.addEventListener('click', function (event) {
        event.preventDefault();
        
        const eventData = {
            id: eventId, // undefined if new
            owner: eventOwnerSelect.value,
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
            store.updateEvent(eventData);
        } else {
            store.addEvent(eventData);
        }

        window.location.href = `index.html?date=${eventData.date}`;
    });
});
