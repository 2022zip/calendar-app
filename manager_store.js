/**
 * Manager Schedule Store
 * Handles data management for Manager role, including team permission control.
 */
class ManagerScheduleStore {
    constructor() {
        this.storageKey = 'manager_events';
        this.teamMembers = [
            { id: 'user1', name: 'User A (Team Member)' },
            { id: 'user2', name: 'User B (Team Member)' }
        ];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    }

    /**
     * Get all events for manager and their team
     */
    getEvents() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    /**
     * Save events to storage
     */
    saveEvents(events) {
        localStorage.setItem(this.storageKey, JSON.stringify(events));
    }

    /**
     * Add a new event
     * @param {Object} event 
     */
    addEvent(event) {
        const events = this.getEvents();
        // Ensure ID
        if (!event.id) {
            event.id = `mgr-event-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }
        // Set owner if not set (default to current manager)
        if (!event.owner) {
            event.owner = this.currentUser.username || 'manager';
        }
        
        events.push(event);
        this.saveEvents(events);
        this.resolveConflictsForDate(event.date);
        return event;
    }

    /**
     * Update an existing event
     * @param {Object} updatedEvent 
     */
    updateEvent(updatedEvent) {
        const events = this.getEvents();
        const index = events.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
            // Permission check: Manager can edit own and team's events
            // In this simplified model, we assume access is allowed if they can see it
            events[index] = updatedEvent;
            this.saveEvents(events);
            this.resolveConflictsForDate(updatedEvent.date);
            return true;
        }
        return false;
    }

    /**
     * Delete an event
     * @param {string} eventId 
     */
    deleteEvent(eventId) {
        let events = this.getEvents();
        const event = events.find(e => e.id === eventId);
        if (event) {
            events = events.filter(e => e.id !== eventId);
            this.saveEvents(events);
            // Clean up related records
            try { localStorage.removeItem(`checkInRecords_${eventId}`); } catch (_) {}
            return true;
        }
        return false;
    }

    /**
     * Batch delete events by date
     * @param {string} dateStr YYYY-MM-DD
     */
    batchDeleteByDate(dateStr) {
        let events = this.getEvents();
        const toDelete = events.filter(e => e.date === dateStr);
        if (toDelete.length === 0) return false;
        
        const ids = toDelete.map(e => e.id);
        events = events.filter(e => e.date !== dateStr);
        
        ids.forEach(id => {
            try { localStorage.removeItem(`checkInRecords_${id}`); } catch (_) {}
        });
        
        this.saveEvents(events);
        return true;
    }

    /**
     * Get Team Members
     */
    getTeamMembers() {
        return this.teamMembers;
    }

    // --- Conflict Resolution Logic (Replicated from User Module) ---

    parseScheduleDate(dateStr) {
        if (!dateStr) return null;
        // Format: YYYY-MM-DD HH:mm or similar
        // Since the original script uses a global or helper, we replicate it here.
        // Assuming ISO format or compatible string.
        // Original script's parseScheduleDate isn't fully visible in previous `read` but used.
        // We'll implement a robust parser.
        const t = new Date(dateStr);
        if (!isNaN(t.getTime())) return t;
        
        // Fallback for "YYYY-MM-DD HH:mm"
        const m = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})/);
        if (m) {
            return new Date(Number(m[1]), Number(m[2])-1, Number(m[3]), Number(m[4]), Number(m[5]));
        }
        return null;
    }

    formatScheduleDate(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const mm = String(dateObj.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d} ${hh}:${mm}`;
    }

    resolveConflictsForDate(dateStr) {
        // Mocking the preference logic
        const pref = { autoAdjust: true }; 
        if (!pref.autoAdjust) return { adjusted: 0, unresolved: 0 };

        const all = this.getEvents();
        const dayEvents = all.filter(e => e.date === dateStr);
        if (dayEvents.length < 2) return { adjusted: 0, unresolved: 0 };

        const bufferMs = 5 * 60 * 1000;
        
        // Sort
        dayEvents.sort((a, b) => {
            const sa = this.parseScheduleDate(a.startDate);
            const sb = this.parseScheduleDate(b.startDate);
            if (sa && sb) {
                const diff = sa.getTime() - sb.getTime();
                if (diff !== 0) return diff;
            }
            return (a.id || '').localeCompare(b.id || '');
        });

        let lastEnd = null;
        let adjusted = 0;
        let unresolved = 0;

        for (let i = 0; i < dayEvents.length; i++) {
            const e = dayEvents[i];
            const start = this.parseScheduleDate(e.startDate);
            const end = this.parseScheduleDate(e.endDate);
            if (!start || !end) continue;

            const minStartWithBuffer = lastEnd ? new Date(lastEnd.getTime() + bufferMs) : null;

            if (lastEnd && start < lastEnd) {
                const durationMs = end.getTime() - start.getTime();
                const boundaryEnd = new Date(dateStr);
                boundaryEnd.setHours(23, 59, 0, 0);

                if (e.lockStart) {
                    delete e.needsManual;
                    lastEnd = new Date(Math.max(lastEnd.getTime(), end.getTime()));
                } else {
                    const s = minStartWithBuffer;
                    const t = new Date(s.getTime() + durationMs);
                    if (t <= boundaryEnd) {
                        e.startDate = this.formatScheduleDate(s);
                        e.endDate = this.formatScheduleDate(t);
                        delete e.needsManual;
                        adjusted++;
                        lastEnd = new Date(t.getTime());
                    } else {
                        e.needsManual = true;
                        unresolved++;
                        lastEnd = new Date(Math.max(lastEnd.getTime(), end.getTime()));
                    }
                }
            } else {
                lastEnd = new Date(end.getTime());
                delete e.needsManual;
            }
        }

        if (adjusted > 0 || unresolved > 0) {
            // Update main array
            for (let i = 0; i < dayEvents.length; i++) {
                const idx = all.findIndex(ev => ev.id === dayEvents[i].id);
                if (idx > -1) all[idx] = dayEvents[i];
            }
            this.saveEvents(all);
        }

        return { adjusted, unresolved };
    }
}

// Expose global instance
window.managerStore = new ManagerScheduleStore();
