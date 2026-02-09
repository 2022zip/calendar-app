/**
 * Manager Schedule List Component
 * Renders the schedule list for Manager role.
 */
class ManagerScheduleList {
    constructor(containerSelector, dateStr) {
        this.container = document.querySelector(containerSelector);
        this.dateStr = dateStr;
        this.store = window.managerStore;
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        
        // Resolve conflicts before rendering
        const { adjusted, unresolved } = this.store.resolveConflictsForDate(this.dateStr);
        if (adjusted > 0) console.log(`Auto-adjusted ${adjusted} events`);
        if (unresolved > 0) console.log(`${unresolved} unresolved conflicts`);

        const events = this.store.getEvents().filter(e => e.date === this.dateStr);

        if (events.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Sort events
        events.sort((a, b) => {
            const sa = this.store.parseScheduleDate(a.startDate);
            const sb = this.store.parseScheduleDate(b.startDate);
            return (sa && sb) ? sa - sb : 0;
        });

        events.forEach(event => {
            const item = document.createElement('div');
            item.className = 'schedule-item manager-schedule-item';
            item.dataset.eventId = event.id;
            
            // Add manager specific styles or classes
            if (event.owner !== (this.store.currentUser.username || 'manager')) {
                item.classList.add('team-member-event');
            }

            // Content
            const content = document.createElement('div');
            content.className = 'item-content';
            
            const title = document.createElement('div');
            title.className = 'item-title';
            title.textContent = event.title || 'Untitled Task';
            
            const time = document.createElement('div');
            time.className = 'item-time';
            const start = this.store.parseScheduleDate(event.startDate);
            const end = this.store.parseScheduleDate(event.endDate);
            if (start && end) {
                const formatTime = d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                time.textContent = `${formatTime(start)} - ${formatTime(end)}`;
            }

            const owner = document.createElement('div');
            owner.className = 'item-owner';
            owner.style.fontSize = '10px';
            owner.style.color = '#666';
            owner.textContent = `Owner: ${event.owner || 'Me'}`;

            content.appendChild(title);
            content.appendChild(time);
            content.appendChild(owner);
            item.appendChild(content);

            // Actions (Edit/Delete)
            // We can implement click to edit
            item.addEventListener('click', () => {
                // Navigate to Manager Editor
                window.location.href = `manager_add_event.html?id=${event.id}&date=${this.dateStr}`;
            });

            this.container.appendChild(item);
        });
    }

    renderEmptyState() {
        const p = document.createElement('p');
        p.textContent = 'No schedule for this day (Manager View)';
        p.style.textAlign = 'center';
        p.style.color = '#888';
        p.style.padding = '20px';
        this.container.appendChild(p);
    }
}

// Expose to window
window.ManagerScheduleList = ManagerScheduleList;
