# Calendar App - Manager Module Update

## Overview
This update introduces a dedicated Schedule Module for the **Manager** role, separate from the standard User module. It includes a dedicated data store, rendering logic, and editor, while maintaining consistency with the original business logic (conflict resolution, batch operations).

## Getting Started

1. **Start the Server**:
   ```bash
   python3 -m http.server 8000
   ```
2. **Access the App**:
   Open [http://localhost:8000](http://localhost:8000)

3. **Login as Manager**:
   - Username: `manager`
   - Password: `manager` (or `123456`)

4. **Verify Manager Schedule**:
   - The main calendar view will automatically load the **Manager Schedule List**.
   - Click a date to view/add events.
   - Click "Add Event" (or `+`) to open the **Manager Editor**.
   - In the editor, you can select the **Owner** (Myself or Team Member).

5. **Run Tests**:
   Open [http://localhost:8000/manager_test.html](http://localhost:8000/manager_test.html) to run the unit tests.

## File Structure Changes

- **Core Logic**:
  - `manager_store.js`: Handles state management (`manager_events`), conflict resolution, and team permissions.
  - `manager_schedule_list.js`: Renders the schedule list for the manager view.
  - `manager_add_event.js` & `.html`: Dedicated event editor for managers.
  - `manager_test.html`: Unit tests.

- **Modified Files**:
  - `index.html`: Loads the new manager scripts.
  - `script.js`: Delegates rendering to `ManagerScheduleList` when logged in as a manager.

## API / Architecture Comparison

| Feature | User Module (Original) | Manager Module (New) |
|---------|------------------------|----------------------|
| **Data Store** | `localStorage['events']` (Direct Access) | `managerStore` (Class-based, `localStorage['manager_events']`) |
| **Logic Location** | `script.js` (Global Functions) | `ManagerScheduleStore` Class |
| **Rendering** | `renderSchedule()` (Global) | `ManagerScheduleList.render()` |
| **Conflict Logic** | `resolveConflictsForDate()` | `managerStore.resolveConflictsForDate()` |
| **Editor** | `add_event.html` | `manager_add_event.html` |
| **Permissions** | None (Personal only) | **Team Support** (Owner field: Self/Team) |
| **Endpoint** | N/A (Client-side) | `/manager/schedule/*` (Logical namespace) |

## Development Notes

- **Conflict Resolution**: The auto-adjustment logic (5min buffer) has been ported 1:1 to `manager_store.js`.
- **Team Management**: Currently mocks 2 team members (`user1`, `user2`).
- **Dependencies**: No external frameworks (Vue/React) used; implemented in Vanilla JS to match project style, but structured as components.
