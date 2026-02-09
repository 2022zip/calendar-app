document.addEventListener('DOMContentLoaded', function () {
    const daysGrid = document.querySelector('.days-grid');
    const scheduleList = document.querySelector('.schedule-list');
    const yearDisplay = document.querySelector('.date-selector .year');
    const monthDisplay = document.querySelector('.date-selector .month');
    const excelImportBtn = document.getElementById('excel-import-btn');
    const excelFileInput = document.getElementById('excel-file-input');
    
    // --- User Info & Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // Always show logout button for everyone (or handle in CSS)
        logoutBtn.style.display = 'inline-block';
        
        logoutBtn.addEventListener('click', function() {
            if (confirm('确定要登出吗？')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.roleName) {
            // Apply Manager View if applicable
            if (currentUser.role === 'manager') {
                document.body.classList.add('manager-view');
                
                // Show Manager specific buttons
                const deptBtn = document.getElementById('dept-schedule-btn');
                const approvalBtn = document.getElementById('approval-btn');
                const excelBtn = document.getElementById('excel-import-btn');
                
                if (deptBtn) {
                    deptBtn.style.display = 'inline-block';
                    deptBtn.addEventListener('click', function() {
                        window.location.href = 'dept_report.html';
                    });
                }
                if (approvalBtn) {
                    approvalBtn.style.display = 'inline-block';
                    approvalBtn.addEventListener('click', function() {
                        window.location.href = 'approval.html';
                    });
                }
                
                // Change logout button text to '登出' (vertical or small box)
                if (logoutBtn) {
                    logoutBtn.innerHTML = '登<br>出'; // Vertical text
                    logoutBtn.style.lineHeight = '1.1';
                }
            } else {
                 // For non-manager, ensure standard buttons are shown/hidden
                 const excelBtn = document.getElementById('excel-import-btn');
                 if (excelBtn) excelBtn.style.display = 'inline-block';
            }

            // Create a small welcome message
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                const userTag = document.createElement('span');
                userTag.id = 'user-info-display'; // Add ID for CSS targeting
                userTag.style.fontSize = '12px';
                userTag.style.marginRight = '5px';
                userTag.style.color = '#333';
                // Format: "登入者: manager"
                userTag.innerHTML = `登入者: <span style="color: #007aff;">${currentUser.username}</span>`;
                
                // In manager view, we want this appended to header-actions or body?
                // The CSS will move it absolutely, so appending to header-actions is fine as long as header-actions is static or part of the relative container.
                // Wait, if header-actions is absolute, putting it inside might constrain it.
                // Better to put it in header-main or header directly?
                // For now keep in header-actions but ensure we can move it out with CSS.
                // Actually, if .header-actions has display:flex, absolute children are relative to it if it has position:relative.
                // If I want to position it relative to the whole header, I might need to move it or set .header-actions to static/contents.
                
                headerActions.insertBefore(userTag, headerActions.firstChild);
            }
        }
    } catch (e) {
        console.error('Error displaying user info', e);
    }

// --- 一次性清空旧测试行程（避免旧测试档复活） ---
    if (!localStorage.getItem('events_cleared_v1')) {
        try {
            localStorage.removeItem('events');
            localStorage.removeItem('migration_done_v6'); // 旧标记一并清掉
            localStorage.setItem('events_cleared_v1', 'true');
        } catch (e) {
            console.warn('无法清空本地 events：', e);
        }
    }
    
    function loadXLSXLib() {
        return new Promise((resolve, reject) => {
            if (window.XLSX) { resolve(); return; }
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('XLSX load failed'));
            document.head.appendChild(s);
        });
    }
    function pickDelimiter(line) {
        const candidates = [',','\t',';','，','|'];
        let best = ','; let bestTimes = -1;
        for (const d of candidates) {
            const cells = splitLine(line, d).map(s => String(s || '').trim());
            const times = cells.slice(1).map(parseTimeRange).filter(Boolean).length;
            if (times > bestTimes) { bestTimes = times; best = d; }
        }
        return best;
    }
    function splitLine(line, delimiter) {
        const res = []; let cur = ''; let inQ = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQ && i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; }
                else { inQ = !inQ; }
            } else if (ch === delimiter && !inQ) {
                res.push(cur); cur = '';
            } else { cur += ch; }
        }
        res.push(cur);
        return res;
    }
    function parseDateCell(s) {
        if (s && typeof s === 'object' && typeof s.getFullYear === 'function') {
            const y = s.getFullYear(); const mo = s.getMonth() + 1; const d = s.getDate();
            return { y, mo, d, iso: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}` };
        }
        if (typeof s === 'number' && window.XLSX && XLSX.SSF && XLSX.SSF.parse_date_code) {
            const o = XLSX.SSF.parse_date_code(s);
            if (o && o.y && o.m && o.d) {
                const y = o.y; const mo = o.m; const d = o.d;
                return { y, mo, d, iso: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}` };
            }
        }
        let t = String(s || '');
        t = t.replace(/^\ufeff/, '');
        t = t.replace(/ハ/g, '_');
        t = t.trim();
        if (!t) return null;
        let m = t.replace(/[．。]/g,'.').match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
        if (!m) return null;
        const y = parseInt(m[1],10); const mo = parseInt(m[2],10); const d = parseInt(m[3],10);
        return { y, mo, d, iso: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}` };
    }
    function parseTimeRange(s) {
        let t = String(s || '').trim();
        t = t.replace(/^\ufeff/, '');
        t = t.replace(/：/g, ':')
             .replace(/[–—－‒―~〜~至到]/g, '-')
             .replace(/\s+/g, '');
        t = t.replace(/([0-9]{1,2})[点时]([0-9]{1,2})/g, '$1:$2')
             .replace(/([0-9]{1,2})[点时](?=[^\d]|$)/g, '$1:00');
        let m = t.match(/^(\d{1,2}):?(\d{2})-(\d{1,2}):?(\d{2})$/);
        if (!m) m = t.match(/^(\d{1,2})(\d{2})-(\d{1,2})(\d{2})$/);
        if (!m) {
            const m2 = t.match(/^(\d{1,2})(?::?(\d{2}))?-(\d{1,2})(?::?(\d{2}))?$/);
            if (m2) {
                return {
                    sh: parseInt(m2[1],10),
                    sm: parseInt(m2[2] || '00',10),
                    eh: parseInt(m2[3],10),
                    em: parseInt(m2[4] || '00',10)
                };
            }
        }
        if (!m) return null;
        return { sh: parseInt(m[1],10), sm: parseInt(m[2],10), eh: parseInt(m[3],10), em: parseInt(m[4],10) };
    }
    var currentYear, currentMonth;
    function importScheduleText(text) {
        const lines = text.split(/\r\n|\n|\r/).filter(l => String(l || '').replace(/^\ufeff/, '').trim().length > 0);
        if (lines.length < 2) return false;
        let headerIdx = 0;
        let delimiter = pickDelimiter(lines[0]);
        let header = splitLine(lines[0], delimiter).map(s => String(s || '').replace(/^\ufeff/, '').trim());
        let timeCols = header.slice(1).map(parseTimeRange);
        if (timeCols.every(v => !v)) {
            for (let i = 0; i < Math.min(lines.length, 50); i++) {
                const tryDelim = pickDelimiter(lines[i]);
                const tryHeader = splitLine(lines[i], tryDelim).map(s => String(s || '').replace(/^\ufeff/, '').trim());
                const tryTimes = tryHeader.slice(1).map(parseTimeRange);
                const ok = tryTimes.some(Boolean);
                if (ok) { headerIdx = i; delimiter = tryDelim; header = tryHeader; timeCols = tryTimes; break; }
            }
        }
        if (timeCols.every(v => !v)) return false;
        let anyImported = false; let lastISO = null; const summary = {}; const changedDates = new Set();
        let events = getStoredEvents();
        const existing = new Set(events.map(e => `${e.date}|${e.startDate}|${e.endDate}|${String(e.title || '').trim()}`));
        for (let i = headerIdx + 1; i < lines.length; i++) {
            const cells = splitLine(lines[i], delimiter);
            const dc = parseDateCell(cells[0]);
            if (!dc) continue;
            lastISO = dc.iso;
            const y = dc.y, mo = dc.mo, d = dc.d;
            const base = new Date(y, mo - 1, d);
            for (let j = 1; j < cells.length && j <= timeCols.length; j++) {
                const title = String(cells[j] || '').trim();
                const tr = timeCols[j - 1];
                if (!title || !tr) continue;
                const s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), tr.sh, tr.sm);
                const t = new Date(base.getFullYear(), base.getMonth(), base.getDate(), tr.eh, tr.em);
                const sStr = formatScheduleDate(s);
                const tStr = formatScheduleDate(t);
                const key = `${dc.iso}|${sStr}|${tStr}|${title}`;
                if (existing.has(key)) continue;
                const id = `event-${Date.now()}-${j}-${Math.floor(Math.random()*10000)}`;
                events.push({ id, title, startDate: sStr, endDate: tStr, date: dc.iso });
                existing.add(key);
                summary[dc.iso] = (summary[dc.iso] || 0) + 1;
                changedDates.add(dc.iso);
                anyImported = true;
            }
        }
        if (anyImported) {
            localStorage.setItem('events', JSON.stringify(events));
            changedDates.forEach(d => resolveConflictsForDate(d));
        }
        if (anyImported && lastISO) {
            const p = lastISO.split('-');
            currentYear = parseInt(p[0],10);
            currentMonth = parseInt(p[1],10) - 1;
            if (yearDisplay) yearDisplay.innerHTML = `&lt; ${currentYear}年`;
            if (monthDisplay) monthDisplay.textContent = `${currentMonth + 1}月`;
            generateCalendar();
            const day = parseInt(p[2],10);
            renderSchedule(day);
            const selected = Array.from(daysGrid.querySelectorAll('.day')).find(d => d.textContent == day);
            if (selected) {
                const curSel = daysGrid.querySelector('.today');
                if (curSel) curSel.classList.remove('today');
                selected.classList.add('today');
            }
        }
        if (Object.keys(summary).length) {
            try { alert(Object.entries(summary).map(([d,c]) => `${d} 导入 ${c} 条`).join('\n')); } catch (_) {}
        } else {
            try { alert('本文件没有新增条目（可能全部已存在），未做任何更改'); } catch (_) {}
        }
        return true;
    }
    function importScheduleRows(rows) {
        if (!Array.isArray(rows) || rows.length < 2) return false;
        const header = rows[0].map(v => String(v || '').trim());
        const timeCols = header.slice(1).map(parseTimeRange);
        if (timeCols.every(v => !v)) return false;
        let anyImported = false; let lastISO = null; const summary = {}; const changedDates = new Set();
        let events = getStoredEvents();
        const existing = new Set(events.map(e => `${e.date}|${e.startDate}|${e.endDate}|${String(e.title || '').trim()}`));
        for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            const dc = parseDateCell(r[0]);
            if (!dc) continue;
            lastISO = dc.iso;
            const base = new Date(dc.y, dc.mo - 1, dc.d);
            for (let j = 1; j < header.length; j++) {
                const title = String((r[j] !== undefined ? r[j] : '')).trim();
                const tr = timeCols[j - 1];
                if (!title || !tr) continue;
                const s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), tr.sh, tr.sm);
                const t = new Date(base.getFullYear(), base.getMonth(), base.getDate(), tr.eh, tr.em);
                const sStr = formatScheduleDate(s);
                const tStr = formatScheduleDate(t);
                const key = `${dc.iso}|${sStr}|${tStr}|${title}`;
                if (existing.has(key)) continue;
                const id = `event-${Date.now()}-${j}-${Math.floor(Math.random()*10000)}`;
                events.push({ id, title, startDate: sStr, endDate: tStr, date: dc.iso });
                existing.add(key);
                summary[dc.iso] = (summary[dc.iso] || 0) + 1;
                changedDates.add(dc.iso);
                anyImported = true;
            }
        }
        if (anyImported) {
            localStorage.setItem('events', JSON.stringify(events));
            changedDates.forEach(d => resolveConflictsForDate(d));
        }
        if (anyImported && lastISO) {
            const p = lastISO.split('-');
            currentYear = parseInt(p[0],10);
            currentMonth = parseInt(p[1],10) - 1;
            if (yearDisplay) yearDisplay.innerHTML = `&lt; ${currentYear}年`;
            if (monthDisplay) monthDisplay.textContent = `${currentMonth + 1}月`;
            generateCalendar();
            const day = parseInt(p[2],10);
            renderSchedule(day);
            const selected = Array.from(daysGrid.querySelectorAll('.day')).find(d => d.textContent == day);
            if (selected) {
                const curSel = daysGrid.querySelector('.today');
                if (curSel) curSel.classList.remove('today');
                selected.classList.add('today');
            }
        }
        if (Object.keys(summary).length) {
            try { alert(Object.entries(summary).map(([d,c]) => `${d} 导入 ${c} 条`).join('\n')); } catch (_) {}
        } else {
            try { alert('本文件没有新增条目（可能全部已存在），未做任何更改'); } catch (_) {}
        }
        return true;
    }
    if (excelImportBtn && excelFileInput) {
        excelImportBtn.addEventListener('click', function() { excelFileInput.click(); });
        excelFileInput.addEventListener('change', async function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const name = String(file.name || '').toLowerCase();
            if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
                try {
                    await loadXLSXLib();
                    const reader = new FileReader();
                    reader.onload = function() {
                        try {
                            const data = new Uint8Array(reader.result);
                            const wb = XLSX.read(data, { type: 'array' });
                            const pickRows = () => {
                                for (const name of wb.SheetNames) {
                                    const sheet = wb.Sheets[name];
                                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true, blankrows: false });
                                    if (Array.isArray(rows) && rows.length) {
                                        const headerIdx = rows.findIndex(r => r && (String(r[0] || '').includes('日期') || (Array.isArray(r) && r.slice(1).some(c => !!parseTimeRange(c)))));
                                        if (headerIdx >= 0) {
                                            const sliced = rows.slice(headerIdx);
                                            const header = sliced[0] || [];
                                            const hasTimes = header.slice(1).some(c => !!parseTimeRange(c));
                                            if (hasTimes) return sliced;
                                        }
                                    }
                                }
                                return null;
                            };
                            const rows = pickRows();
                            const ok = rows ? importScheduleRows(rows) : false;
                            if (!ok) alert('导入失败：请确认首列为日期，后续各列表头为时间段。');
                        } catch (err) {
                            alert('Excel解析失败');
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } catch (_) {
                    alert('无法加载Excel解析库');
                }
            } else {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const buf = reader.result;
                        const u8 = new Uint8Array(buf);
                        const tryEnc = (enc) => {
                            try { return importScheduleText(new TextDecoder(enc).decode(u8)); } catch (_) { return false; }
                        };
                        const ok = tryEnc('utf-8') || tryEnc('utf-16le') || tryEnc('utf-16be') || tryEnc('macintosh') || tryEnc('windows-1252');
                        if (!ok) alert('导入失败：请确认首列为日期，后续列表头为时间段，且文件编码为 UTF-8/UTF-16。');
                    } catch (_) {
                        alert('文本解析失败');
                    }
                };
                reader.readAsArrayBuffer(file);
            }
            e.target.value = '';
        });
    }

    (function(){
        const p = new URLSearchParams(window.location.search);
        const t = p.get('testImport');
        const cs = p.get('clearStorage') || p.get('resetStorage') || p.get('clear');
        if (cs === '1' || cs === 'true') {
            try {
                const keys = Object.keys(localStorage);
                for (let i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
                alert('已清空预览暂存');
            } catch (_) {}
        }
        if (t === 'csv') {
            const sample = [
                '日期,08:30-10:00,10:00-10:30,10:30-11:00,11:00-12:00,12:00-13:00,13:00-13:30,13:30-14:00',
                '2025/7/21,杭州凌神自成设备有限公司等需求沟通（线上）,达到自动化会议整理与系统点整理,前往杭州兴帆包装材料有限公司途中客户案要点复盘,杭州兴帆包装材料有限公司仓储与生产协同现况访谈,与兴帆包装负责人午餐沟通（确认试点产线与指标）,兴帆包装会议纪要与关键行动项记录,杭州华伉实业有限公司业务结构与产品线快速梳理',
                '2025/7/22,杭州旭业实业有限公司经营现况与数字化盘点沟通,旭业实业内流程瓶颈与系统切入点整理,前往杭州兴帆包装材料有限公司途中客户方案要点复盘,杭州兴帆包装材料有限公司仓储与生产协同现况访谈,与兴帆包装负责人午餐沟通（确认试点产线与指标）,兴帆包装会议纪要与关键行动项记录,杭州华伉实业有限公司业务结构与产品线快速梳理'
            ].join('\n');
            importScheduleText(sample);
        }
    })();

    currentYear = currentYear;
    currentMonth = currentMonth;

    function bulkDeleteByDate(dateStr) {
        let events = getStoredEvents();
        const toDelete = events.filter(e => e.date === dateStr);
        if (toDelete.length === 0) return false;
        const ids = new Set(toDelete.map(e => e.id));
        events = events.filter(e => e.date !== dateStr);
        ids.forEach(id => {
            try { localStorage.removeItem(`checkInRecords_${id}`); } catch (_) {}
        });
        localStorage.setItem('events', JSON.stringify(events));
        return true;
    }
    function initialize() {
        const hashParams = new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : '');
        const urlParams = new URLSearchParams(window.location.search);
        const deleteDateParam = urlParams.get('deleteDate') || hashParams.get('deleteDate');
        const doDelete = (urlParams.get('confirm') || hashParams.get('confirm')) === 'yes';
        if (deleteDateParam && doDelete) {
            bulkDeleteByDate(deleteDateParam);
        }
        const adjustDateParam = urlParams.get('adjustDate') || hashParams.get('adjustDate');
        const pairParam = urlParams.get('pair') || hashParams.get('pair');
        if (adjustDateParam && pairParam) {
            const parts = pairParam.split(',');
            if (parts.length === 2) {
                adjustPairByTitles(adjustDateParam, parts[0], parts[1]);
            }
        }
        const dateParam = (urlParams.get('date') || hashParams.get('date') || deleteDateParam || adjustDateParam);
        let initialDay;

        if (dateParam) {
            const parts = dateParam.split('-').map(p => parseInt(p, 10));
            if (parts.length === 3 && !parts.some(isNaN)) {
                currentYear = parts[0];
                currentMonth = parts[1] - 1;
                initialDay = parts[2];
            } else {
                const today = new Date();
                currentYear = today.getFullYear();
                currentMonth = today.getMonth();
                initialDay = today.getDate();
            }
        } else {
            currentYear = 2025;
            currentMonth = 11; // December
            initialDay = 2;
        }

        if (yearDisplay) {
            yearDisplay.innerHTML = `&lt; ${currentYear}年`;
        }
        if (monthDisplay) {
            monthDisplay.textContent = `${currentMonth + 1}月`;
        }

        migrateEventsTo24h();
        generateCalendar();
        renderSchedule(initialDay);

        // Highlight the correct day in the calendar without simulating a click
        const currentSelected = daysGrid.querySelector('.today');
        if (currentSelected) {
            currentSelected.classList.remove('today');
        }
        const dayToSelect = Array.from(daysGrid.querySelectorAll('.day')).find(d => d.textContent == initialDay);
        if (dayToSelect) {
            dayToSelect.classList.add('today');
            // Scroll to the selected day
            dayToSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Update the 'Add Event' button link
        const selectedDate = new Date(currentYear, currentMonth, initialDay);
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const addEventBtn = document.getElementById('add-event-btn');
        if (addEventBtn) {
            addEventBtn.href = `add_event.html?date=${formattedDate}`;
        }
    }

    window.addEventListener('hashchange', initialize);
    initialize();

    function getStoredEvents() {
        return JSON.parse(localStorage.getItem('events')) || [];
    }

    function migrateEventsTo24h() {
        const periodRegex = /(凌晨|早上|上午|中午|下午|晚上)/;
        let events = getStoredEvents();
        let changed = false;
        for (let i = 0; i < events.length; i++) {
            const e = events[i];
            const sObj = parseScheduleDate(e.startDate || '');
            const tObj = parseScheduleDate(e.endDate || '');
            const sOld = typeof e.startDate === 'string' && periodRegex.test(e.startDate);
            const tOld = typeof e.endDate === 'string' && periodRegex.test(e.endDate);
            if (sObj && sOld) { e.startDate = formatScheduleDate(sObj); changed = true; }
            if (tObj && tOld) { e.endDate = formatScheduleDate(tObj); changed = true; }
        }
        if (changed) localStorage.setItem('events', JSON.stringify(events));
    }

    function getEventRecords(eventId) {
        try {
            const key = `checkInRecords_${eventId}`;
            const records = JSON.parse(localStorage.getItem(key)) || [];
            return Array.isArray(records) ? records : [];
        } catch (e) {
            return [];
        }
    }

    function getConflictPref() {
        try {
            const raw = JSON.parse(localStorage.getItem('conflictPref') || '{}');
            const autoAdjust = raw.autoAdjust !== false;
            const shortShiftMinutes = Number(raw.shortShiftMinutes) > 0 ? Number(raw.shortShiftMinutes) : 15;
            const longShiftRatio = Number(raw.longShiftRatio) > 0 ? Number(raw.longShiftRatio) : 0.5;
            return { autoAdjust, shortShiftMinutes, longShiftRatio };
        } catch (_) {
            return { autoAdjust: true, shortShiftMinutes: 15, longShiftRatio: 0.5 };
        }
    }

    function tryNotify(title, body) {
        const send = () => {
            try { new Notification(title, { body }); } catch (_) {}
        };
        if (window.Notification) {
            if (Notification.permission === 'granted') {
                send();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(p => { if (p === 'granted') send(); });
            }
        }
    }

    function resolveConflictsForDate(dateStr) {
        const pref = getConflictPref();
        if (!pref.autoAdjust) return { adjusted: 0, unresolved: 0 };
        const all = getStoredEvents();
        const dayEvents = all.filter(e => e.date === dateStr);
        if (dayEvents.length < 2) return { adjusted: 0, unresolved: 0 };
        const bufferMs = 5 * 60 * 1000;
        dayEvents.sort((a, b) => {
            const sa = parseScheduleDate(a.startDate);
            const sb = parseScheduleDate(b.startDate);
            if (sa && sb) {
                const diff = sa.getTime() - sb.getTime();
                if (diff !== 0) return diff;
                const ida = Number(String(a.id || '').replace('event-', '')) || 0;
                const idb = Number(String(b.id || '').replace('event-', '')) || 0;
                return idb - ida;
            }
            const ida = Number(String(a.id || '').replace('event-', '')) || 0;
            const idb = Number(String(b.id || '').replace('event-', '')) || 0;
            return ida - idb;
        });
        let lastEnd = null;
        let adjusted = 0;
        let unresolved = 0;
        for (let i = 0; i < dayEvents.length; i++) {
            const e = dayEvents[i];
            const start = parseScheduleDate(e.startDate);
            const end = parseScheduleDate(e.endDate);
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
                        e.startDate = formatScheduleDate(s);
                        e.endDate = formatScheduleDate(t);
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
            for (let i = 0; i < dayEvents.length; i++) {
                const idx = all.findIndex(ev => ev.id === dayEvents[i].id);
                if (idx > -1) all[idx] = dayEvents[i];
            }
            localStorage.setItem('events', JSON.stringify(all));
            if (adjusted > 0) tryNotify('系统通知', `已自动调整${adjusted}项冲突日程`);
            if (unresolved > 0) tryNotify('系统通知', `${unresolved}项冲突需人工处理`);
        }
        return { adjusted, unresolved };
    }
    function adjustPairByTitles(dateStr, titleA, titleB) {
        const bufferMs = 5 * 60 * 1000;
        const all = getStoredEvents();
        const dayEvents = all.filter(e => e.date === dateStr);
        const a = dayEvents.find(e => e.title === titleA);
        const b = dayEvents.find(e => e.title === titleB);
        if (!a || !b) return false;
        const aStart = parseScheduleDate(a.startDate);
        const aEnd = parseScheduleDate(a.endDate);
        const bStart = parseScheduleDate(b.startDate);
        const bEnd = parseScheduleDate(b.endDate);
        if (!aStart || !aEnd || !bStart || !bEnd) return false;
        const boundaryStart = new Date(dateStr); boundaryStart.setHours(0,0,0,0);
        const boundaryEnd = new Date(dateStr); boundaryEnd.setHours(23,59,0,0);
        const aDur = aEnd.getTime() - aStart.getTime();
        const bDur = bEnd.getTime() - bStart.getTime();
        let changed = false;
        if (bStart.getTime() < aEnd.getTime() + bufferMs) {
            const preferShiftB = a.lockStart || !b.lockStart;
            if (preferShiftB) {
                const targetBStart = new Date(aEnd.getTime() + bufferMs);
                const targetBEnd = new Date(targetBStart.getTime() + bDur);
                let newDateStr = dateStr;
                if (targetBEnd > boundaryEnd) {
                    const nextDay = new Date(boundaryStart.getTime() + 24 * 60 * 60 * 1000);
                    newDateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
                }
                b.startDate = formatScheduleDate(targetBStart);
                b.endDate = formatScheduleDate(targetBEnd);
                b.date = newDateStr;
                changed = true;
            } else {
                const targetAEnd = new Date(bStart.getTime() - bufferMs);
                const targetAStart = new Date(targetAEnd.getTime() - aDur);
                if (targetAStart >= boundaryStart) {
                    a.startDate = formatScheduleDate(targetAStart);
                    a.endDate = formatScheduleDate(targetAEnd);
                    changed = true;
                } else {
                    b.needsManual = true;
                }
            }
        }
        if (changed) {
            for (const ev of [a,b]) {
                const idx = all.findIndex(e => e.id === ev.id);
                if (idx > -1) all[idx] = ev;
            }
            localStorage.setItem('events', JSON.stringify(all));
            resolveConflictsForDate(dateStr);
            tryNotify('系统通知', 'AA与BB已调整，保持5分钟缓冲');
        }
        return changed;
    }

    function enforceAfter(dateStr, anchorTitle, targetTitle) {
        const bufferMs = 5 * 60 * 1000;
        const all = getStoredEvents();
        const dayEvents = all.filter(e => e.date === dateStr);
        const anchor = dayEvents.find(e => e.title === anchorTitle || String(e.title || '').includes(anchorTitle));
        const target = dayEvents.find(e => e.title === targetTitle || String(e.title || '').includes(targetTitle));
        if (!anchor || !target) return false;
        const aStart = parseScheduleDate(anchor.startDate);
        const aEnd = parseScheduleDate(anchor.endDate);
        const tStart = parseScheduleDate(target.startDate);
        const tEnd = parseScheduleDate(target.endDate);
        if (!aStart || !aEnd || !tStart || !tEnd) return false;
        const tDur = tEnd.getTime() - tStart.getTime();
        if (tStart.getTime() >= aEnd.getTime() + bufferMs) return false;
        const boundaryStart = new Date(dateStr); boundaryStart.setHours(0,0,0,0);
        const boundaryEnd = new Date(dateStr); boundaryEnd.setHours(23,59,0,0);
        const newStart = new Date(aEnd.getTime() + bufferMs);
        const newEnd = new Date(newStart.getTime() + tDur);
        let newDateStr = dateStr;
        if (newEnd > boundaryEnd) {
            const nextDay = new Date(boundaryStart.getTime() + 24 * 60 * 60 * 1000);
            newDateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        }
        target.startDate = formatScheduleDate(newStart);
        target.endDate = formatScheduleDate(newEnd);
        target.date = newDateStr;
        const idx = all.findIndex(e => e.id === target.id);
        if (idx > -1) all[idx] = target;
        localStorage.setItem('events', JSON.stringify(all));
        resolveConflictsForDate(newDateStr);
        tryNotify('系统通知', `${anchorTitle}优先，${targetTitle}顺延至${String(newStart.getHours()).padStart(2,'0')}:${String(newStart.getMinutes()).padStart(2,'0')}-${String(newEnd.getHours()).padStart(2,'0')}:${String(newEnd.getMinutes()).padStart(2,'0')}`);
        return true;
    }

    function hasValidCheckIn(eventId) {
        const records = getEventRecords(eventId);
        return records.some(r => r && r.type === '到场打卡' && typeof r.time === 'string');
    }

    function hasValidCheckOut(eventId) {
        const records = getEventRecords(eventId);
        return records.some(r => r && r.type === '离场打卡' && typeof r.time === 'string');
    }

    function generateCalendar() {
        daysGrid.innerHTML = '';
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const storedEvents = getStoredEvents();

        for (let i = 0; i < firstDayOfMonth; i++) {
            daysGrid.innerHTML += '<div></div>';
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasEvent = storedEvents.some(event => event.date === dateStr);
            if (hasEvent) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dayDiv.appendChild(dot);
            }
            
            dayDiv.addEventListener('click', () => {
                const currentSelected = daysGrid.querySelector('.today');
                if (currentSelected) {
                    currentSelected.classList.remove('today');
                }
                dayDiv.classList.add('today');
                renderSchedule(i);

                const selectedDate = new Date(currentYear, currentMonth, i);
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                
                const addEventBtn = document.getElementById('add-event-btn');
                if (addEventBtn) {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    if (currentUser.role === 'manager') {
                        addEventBtn.href = `manager_add_event.html?date=${formattedDate}`;
                    } else {
                        addEventBtn.href = `add_event.html?date=${formattedDate}`;
                    }
                }
            });

            daysGrid.appendChild(dayDiv);
        }
    }

    function renderSchedule(day) {
        scheduleList.innerHTML = '';
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        resolveConflictsForDate(dateStr);
        enforceAfter(dateStr, 'QWA', '测试用');
        const allEvents = getStoredEvents().filter(event => event.date === dateStr);

        if (allEvents.length === 0) {
            const noEventsMessage = document.createElement('p');
            noEventsMessage.textContent = '本日无行程';
            noEventsMessage.style.textAlign = 'center';
            noEventsMessage.style.color = '#8e8e93';
            noEventsMessage.style.padding = '20px';
            scheduleList.appendChild(noEventsMessage);
            return;
        }



        allEvents.sort((a, b) => {
            const dateA = parseScheduleDate(a.startDate);
            const dateB = parseScheduleDate(b.startDate);
            if (dateA && dateB) {
                return dateA - dateB;
            }
            return 0;
        }).forEach(event => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.setAttribute('draggable', 'true');
            item.dataset.eventId = event.id;

            if (event.type === 'check-in-record') {
                item.classList.add('check-in-record');
                
                item.addEventListener('click', (e) => {
                     e.stopPropagation();
                     window.location.href = `add_event.html?id=${event.id}&date=${dateStr}`;
                });

                const colorBar = document.createElement('div');
                colorBar.className = 'color-bar';
                colorBar.style.backgroundColor = event.color || '#4A90E2';
                
                const itemContent = document.createElement('div');
                itemContent.className = 'item-content check-in-content';
                const itemTitle = document.createElement('div');
                itemTitle.className = 'item-title';
                (function(){
                    const isDefaultTitle = (t) => !t || t === '外勤打卡' || /^\d{1,2}:\d{2}任务$/.test(t) || t === '任务';
                    let displayTitle = null;
                    if (event.title && !isDefaultTitle(event.title)) {
                        displayTitle = event.title;
                    }
                    if (!displayTitle) {
                        let hm = null;
                        const sD = parseScheduleDate(event.startDate);
                        if (sD) hm = `${String(sD.getHours()).padStart(2,'0')}:${String(sD.getMinutes()).padStart(2,'0')}`;
                        else if (event.checkInTime) hm = String(event.checkInTime);
                        displayTitle = hm ? `${hm}任务` : (event.title || '任务');
                    }
                    itemTitle.textContent = displayTitle;
                })();
                itemContent.appendChild(itemTitle);
                
                const btnContainer = document.createElement('div');
                btnContainer.className = 'check-in-buttons';
                
                const arriveBtn = document.createElement('div');
                arriveBtn.className = `check-in-capsule arrive ${event.hasCheckIn ? 'active' : ''}`;
                arriveBtn.textContent = '到场打卡';
                arriveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `check_in.html?eventId=${event.id}&date=${dateStr}&type=check-in&source=schedule`;
                });
                
                const leaveBtn = document.createElement('div');
                leaveBtn.className = `check-in-capsule leave ${event.hasCheckOut ? 'active' : ''}`;
                leaveBtn.textContent = '离场打卡';
                leaveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `check_in.html?eventId=${event.id}&date=${dateStr}&type=check-out&source=schedule`;
                });
                
                btnContainer.appendChild(arriveBtn);
                btnContainer.appendChild(leaveBtn);
                itemContent.appendChild(btnContainer);
                
            const itemTime = document.createElement('div');
            itemTime.className = 'item-time';

            let sDate = parseScheduleDate(event.startDate);
            if (!sDate) {
                const hm = String(event.checkInTime || '').split(':');
                const yy = Number(dateStr.split('-')[0]);
                const mm = Number(dateStr.split('-')[1]);
                const dd = Number(dateStr.split('-')[2]);
                const startObj = new Date(yy, mm - 1, dd, Number(hm[0] || 0), Number(hm[1] || 0));
                const endObj = new Date(startObj.getTime() + 60 * 60 * 1000);
                event.startDate = formatScheduleDate(startObj);
                event.endDate = formatScheduleDate(endObj);
                sDate = startObj;
                const allEventsFixed = getStoredEvents();
                const idxFix = allEventsFixed.findIndex(e => e.id === event.id);
                if (idxFix > -1) {
                    allEventsFixed[idxFix] = event;
                    localStorage.setItem('events', JSON.stringify(allEventsFixed));
                }
            }
            if (sDate) {
                const st = document.createElement('div');
                st.textContent = `${String(sDate.getHours()).padStart(2, '0')}:${String(sDate.getMinutes()).padStart(2, '0')}`;
                itemTime.appendChild(st);
            }
            let eDate = parseScheduleDate(event.endDate);
            if (!eDate && sDate) {
                eDate = new Date(sDate.getTime() + 60 * 60 * 1000);
            }
            if (eDate) {
                const et = document.createElement('div');
                et.className = 'end-time';
                et.textContent = `${String(eDate.getHours()).padStart(2, '0')}:${String(eDate.getMinutes()).padStart(2, '0')}`;
                itemTime.appendChild(et);
            }

                item.appendChild(colorBar);
                item.appendChild(itemContent);
                item.appendChild(itemTime);
                scheduleList.appendChild(item);
                return;
            }

            if (event.needsManual) { item.classList.add('conflict'); }

            if (event.id) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', (e) => {
                    // Stop propagation to prevent the event from bubbling up to the parent
                    e.stopPropagation();
                    const dateStrForLink = dateStr;
                    window.location.href = `add_event.html?id=${event.id}&date=${dateStrForLink}`;
                });
            }
            
            const colorBar = document.createElement('div');
            colorBar.className = 'color-bar';
            colorBar.style.backgroundColor = event.color || '#4A90E2';

            const itemContent = document.createElement('div');
            itemContent.className = 'item-content';

            const itemTitle = document.createElement('div');
            itemTitle.className = 'item-title';
            itemTitle.textContent = event.title;
            if (event.needsManual) {
                const badge = document.createElement('span');
                badge.textContent = '冲突';
                badge.style.cssText = 'margin-left:8px;color:#FF3B30;font-size:12px;';
                itemTitle.appendChild(badge);
            }
            itemContent.appendChild(itemTitle);

            if (event.notes) {
                const itemNotes = document.createElement('div');
                itemNotes.className = 'item-notes';
                itemNotes.textContent = event.notes;
                itemContent.appendChild(itemNotes);
            }

            const itemTime = document.createElement('div');
            itemTime.className = 'item-time';

            const startTimeDiv = document.createElement('div');
            const startDate = parseScheduleDate(event.startDate);
            if (startDate) {
                startTimeDiv.textContent = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
            }
            itemTime.appendChild(startTimeDiv);

            const endTimeDiv = document.createElement('div');
            endTimeDiv.className = 'end-time';
            if (event.endDate) {
                const endDate = parseScheduleDate(event.endDate);
                if (endDate) {
                    endTimeDiv.textContent = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                }
            }
            itemTime.appendChild(endTimeDiv);

            item.appendChild(colorBar);
            item.appendChild(itemContent);



            item.appendChild(itemTime);

            const shouldShowButtons = (() => {
                const text = `${event.title || ''}${event.notes || ''}`;
                const keywords = ['现场','访谈','公司','合同','同区客户'];
                return keywords.some(k => text.includes(k));
            })();

            if (shouldShowButtons) {
                const checkInButton = document.createElement('a');
                checkInButton.href = `check_in.html?eventId=${event.id}&date=${event.date}&type=check-in&eventTitle=${encodeURIComponent(event.title)}`;
                checkInButton.textContent = '到场打卡';
                checkInButton.classList.add('check-in-btn');
                if (hasValidCheckIn(event.id)) {
                    checkInButton.classList.add('has-record');
                }
                item.appendChild(checkInButton);

                const checkOutButton = document.createElement('a');
                checkOutButton.href = `check_in.html?eventId=${event.id}&date=${event.date}&type=check-out&eventTitle=${encodeURIComponent(event.title)}`;
                checkOutButton.textContent = '离场打卡';
                checkOutButton.classList.add('check-out-btn');
                if (hasValidCheckOut(event.id)) {
                    checkOutButton.classList.add('has-record');
                }
                item.appendChild(checkOutButton);
            }

            scheduleList.appendChild(item);

            const itemActions = document.createElement('div');
            itemActions.className = 'item-actions';

            const checkInBtn = item.querySelector('.check-in-btn');
            const checkOutBtn = item.querySelector('.check-out-btn');

            if (checkInBtn) itemActions.appendChild(checkInBtn);
            if (checkOutBtn) itemActions.appendChild(checkOutBtn);

            const timeElement = item.querySelector('.item-time');
            if (timeElement && itemActions.childElementCount > 0) {
                item.insertBefore(itemActions, timeElement);
            }
        });
    }

    scheduleList.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('schedule-item')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.eventId);
            e.target.classList.add('dragging');
        }
    });

    scheduleList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(scheduleList, e.clientY);
        if (afterElement == null) {
            scheduleList.appendChild(draggingItem);
        } else {
            scheduleList.insertBefore(draggingItem, afterElement);
        }
    });

    scheduleList.addEventListener('drop', function(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (draggingItem) {
            updateEventDataAfterDrop(draggingItem);
            draggingItem.classList.remove('dragging');
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.schedule-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function parseScheduleDate(dateStr) {
        if (typeof dateStr !== 'string') return null;
        let m = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
        if (m) {
            const year = parseInt(m[1]);
            const month = parseInt(m[2]) - 1;
            const day = parseInt(m[3]);
            const hours = parseInt(m[4]);
            const minutes = parseInt(m[5]);
            return new Date(year, month, day, hours, minutes);
        }
        m = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:凌晨|早上|上午|中午|下午|晚上)\s*(\d{1,2}):(\d{2})/);
        if (m) {
            const year = parseInt(m[1]);
            const month = parseInt(m[2]) - 1;
            const day = parseInt(m[3]);
            let hours = parseInt(m[4]);
            const minutes = parseInt(m[5]);
            const period = (dateStr.match(/(凌晨|早上|上午|中午|下午|晚上)/) || [null])[1];
            const pmLike = period === '下午' || period === '晚上' || period === '中午';
            const amLike = period === '上午' || period === '早上' || period === '凌晨';
            if (pmLike && hours !== 12) hours += 12;
            if (amLike && hours === 12) hours = 0;
            return new Date(year, month, day, hours, minutes);
        }
        return null;
    }

    function formatScheduleDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    }
    function formatScheduleDateCN(dateObj) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        let h24 = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        let period = '上午';
        if (h24 >= 12) period = '下午';
        let h12 = h24 % 12; if (h12 === 0) h12 = 12;
        const hours = String(h12).padStart(2, '0');
        return `${year}年${month}月${day}日 ${period}${hours}:${minutes}`;
    }

    function updateEventDataAfterDrop(draggingItem) {
        const orderedItemElements = [...scheduleList.querySelectorAll('.schedule-item')];
        const orderedIds = orderedItemElements.map(item => item.dataset.eventId);
        let storedEvents = getStoredEvents();
        const draggedEventId = draggingItem.dataset.eventId;

        const draggedIndex = orderedIds.indexOf(draggedEventId);
        const dayEvents = orderedIds
            .map(id => storedEvents.find(e => e.id === id))
            .filter(e => !!e);

        if (draggedIndex === -1 || dayEvents.length === 0) return;

        const durations = dayEvents.map(e => {
            const s = parseScheduleDate(e.startDate);
            const t = parseScheduleDate(e.endDate);
            return s && t ? (t.getTime() - s.getTime()) : 0;
        });

        let anchorStart;
        if (draggedIndex > 0) {
            const prevEnd = parseScheduleDate(dayEvents[draggedIndex - 1].endDate);
            anchorStart = prevEnd ? new Date(prevEnd.getTime()) : parseScheduleDate(dayEvents[draggedIndex].startDate);
        } else {
            const draggedStart = parseScheduleDate(dayEvents[draggedIndex].startDate);
            anchorStart = draggedStart ? new Date(draggedStart.getTime()) : null;
            if (!anchorStart) {
                for (let i = 0; i < dayEvents.length; i++) {
                    const candidate = parseScheduleDate(dayEvents[i].startDate);
                    if (candidate) { anchorStart = new Date(candidate.getTime()); break; }
                }
                if (!anchorStart) anchorStart = new Date();
            }
        }

        const anchorEnd = new Date(anchorStart.getTime() + durations[draggedIndex]);
        dayEvents[draggedIndex].startDate = formatScheduleDate(anchorStart);
        dayEvents[draggedIndex].endDate = formatScheduleDate(anchorEnd);

        for (let i = draggedIndex + 1; i < dayEvents.length; i++) {
            const prevEndObj = parseScheduleDate(dayEvents[i - 1].endDate);
            if (!prevEndObj) break;
            const startObj = new Date(prevEndObj.getTime());
            const endObj = new Date(startObj.getTime() + durations[i]);

            const dateStr = dayEvents[i - 1].date;
            const boundaryStart = new Date(dateStr);
            boundaryStart.setHours(0, 0, 0, 0);
            const boundaryEnd = new Date(dateStr);
            boundaryEnd.setHours(23, 59, 0, 0);

            let newDateStr = dateStr;
            if (endObj > boundaryEnd) {
                const nextDay = new Date(boundaryStart.getTime() + 24 * 60 * 60 * 1000);
                newDateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
            }

            dayEvents[i].startDate = formatScheduleDate(startObj);
            dayEvents[i].endDate = formatScheduleDate(endObj);
            dayEvents[i].date = newDateStr;
        }

        for (let i = 0; i < dayEvents.length; i++) {
            const idx = storedEvents.findIndex(e => e.id === dayEvents[i].id);
            if (idx > -1) storedEvents[idx] = dayEvents[i];
        }

        localStorage.setItem('events', JSON.stringify(storedEvents));

        const day = new Date(dayEvents[Math.min(draggedIndex, dayEvents.length - 1)].date).getDate();
        renderSchedule(day);
    }

    // --- Search Functionality ---
    const searchIcon = document.querySelector('.header-actions .icon');
    let searchOverlay, searchInput, searchResults;

    function createSearchOverlay() {
        if (document.getElementById('search-overlay')) return;

        searchOverlay = document.createElement('div');
        searchOverlay.id = 'search-overlay';
        searchOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 1); z-index: 1000; padding: 15px;
            display: flex; flex-direction: column; box-sizing: border-box;
        `;

        const searchBar = document.createElement('div');
        searchBar.style.cssText = `display: flex; align-items: center; margin-bottom: 15px;`;

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '搜索日程...';
        searchInput.style.cssText = `
            flex-grow: 1; padding: 10px; border: 1px solid #ccc; 
            border-radius: 5px; font-size: 16px;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '取消';
        closeButton.style.cssText = `
            background: none; border: none; font-size: 16px; 
            color: #007AFF; margin-left: 10px; cursor: pointer;
        `;

        searchResults = document.createElement('div');
        searchResults.id = 'search-results';
        searchResults.style.cssText = `overflow-y: auto;`;

        searchBar.appendChild(searchInput);
        searchBar.appendChild(closeButton);
        searchOverlay.appendChild(searchBar);
        searchOverlay.appendChild(searchResults);
        document.body.appendChild(searchOverlay);

        closeButton.addEventListener('click', () => {
            document.body.removeChild(searchOverlay);
        });

        searchInput.addEventListener('input', performSearch);
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';
        if (query.length < 1) return;

        const allEvents = getStoredEvents();
        const filteredEvents = allEvents.filter(event => 
            event.title.toLowerCase().includes(query)
        );

        // Group events by date
        const groupedByDate = filteredEvents.reduce((acc, event) => {
            const date = event.date; // Assuming YYYY-MM-DD format
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {});

        // Sort dates and display
        Object.keys(groupedByDate).sort().forEach(date => {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = date.replace(/-/g, '/');
            dateHeader.style.cssText = `font-size: 14px; color: #8e8e93; margin: 10px 0 5px;`;
            searchResults.appendChild(dateHeader);

            groupedByDate[date].forEach(event => {
                const resultItem = document.createElement('div');
                resultItem.textContent = event.title;
                resultItem.style.cssText = `
                    padding: 12px; background: #f0f0f0; border-radius: 5px; margin-bottom: 8px; cursor: pointer;
                `;
                resultItem.addEventListener('click', () => {
                    window.location.href = `index.html?date=${event.date}`;
                    document.body.removeChild(searchOverlay);
                });
                searchResults.appendChild(resultItem);
            });
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', createSearchOverlay);
    }

    // --- Clear Check-in Functionality ---
    const clearCheckinBtn = document.getElementById('clear-checkin-btn');
    if (clearCheckinBtn) {
        clearCheckinBtn.addEventListener('click', () => {
            if (confirm('您确定要清除所有的签到打卡记录吗？此操作不可撤销。')) {
                const allEvents = getStoredEvents();
                const updatedEvents = allEvents.map(event => {
                    delete event.checkIn;
                    delete event.checkOut;
                    return event;
                });
                localStorage.setItem('events', JSON.stringify(updatedEvents));
                events = getStoredEvents(); // Re-fetch events to update the global variable
                // Re-render the calendar to reflect the changes
                renderCalendar(currentYear, currentMonth);
                // Also update the schedule view for the currently selected day
                const selectedDayElem = document.querySelector('.day.selected');
                if (selectedDayElem) {
                    renderSchedule(parseInt(selectedDayElem.textContent));
                } else {
                    // If no day is selected, maybe render for today or clear the schedule view
                    document.getElementById('schedule-list').innerHTML = '';
                }
                alert('所有签到打卡记录已成功清除。');
            }
        });
    }
});
