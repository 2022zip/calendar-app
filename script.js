document.addEventListener('DOMContentLoaded', function () {
    const daysGrid = document.querySelector('.days-grid');
    const scheduleList = document.querySelector('.schedule-list');
    const yearDisplay = document.querySelector('.date-selector .year');
    const monthDisplay = document.querySelector('.date-selector .month');

    const today = new Date();
    let currentYear = 2025;
    let currentMonth = 6; // July is 6 (0-indexed)

    if (yearDisplay) {
        yearDisplay.innerHTML = `&lt; ${currentYear}年`;
    }
    if (monthDisplay) {
        monthDisplay.textContent = `${currentMonth + 1}月`;
    }

    // One-time migration of hardcoded events to localStorage
    if (!localStorage.getItem('migration_done_v2')) {
        const hardcodedEvents = [
            {
                id: 'event-1',
                title: '宁波大央科技有限公司',
                startDate: '2025年7月9日 上午10:30',
                endDate: '2025年7月9日 上午10:40',
                date: '2025-07-09',
                notes: '宁波大央科技有限公司案情速览',
                customerLevel: '宁波大央科技成立于2010年，专注光电子灭蚊与植物源驱蚊，拥有数百项病媒防控专利，是行业标准牵头单位之一。 公开招聘信息显示：公司建筑面积约5.5万㎡，年产值约5亿元人民币、年出口约千万美元，员工规模约600人，在有些口径下被归入“1000–5000人”档的高成长科技型中小企业/隐形冠军培育企业。 → 归类：细分赛道中型偏大型制造+电商企业，有研发、有品牌、有出口，有一定IT/管理投入能力。',
                hiddenNeeds: '1.1.多品牌多渠道一体化管理：旗下“大央、俏蜻蜓、Cokit、Kinven”等多品牌，既做欧美ODM/OEM，又做国内电商与连锁药房/KA，典型“多品牌+多渠道+多地区”经营，容易出现订单、库存、价格、促销、铺货数据分散的问题，需要更强的全渠道经营与库存可视化。\n\n 2. 研发与知识产权资产化管理：手握数百项专利、主导行业标准，核心优势在技术与配方，但专利、标准、实验数据分散在不同系统与文档中，存在研发项目进度、成果沉淀、专利与配方的全生命周期管理需求。\n\n 3. 制造与品质精益化：有多条物理蚊虫防控生产线和在建新厂区，产品又要满足欧美与国内多重认证，对MES/质检追溯、批次管理、设备效率与良率分析的精细化要求会逐步抬高。\n\n 4. 合规与标准化运营：公司牵头起草户外UV LED灭蚊灯行业标准，并通过BSCI、ISO与知识产权管理规范等认证，对外要对接政府招标、商超/药房连锁与海外客户，对内需要标准化流程与合规风险管控（认证、检测报告、供应链准入等）。',
                caseJudgment: '• 客户定位：这是一个在细分驱蚊/光电灭蚊赛道里具有话语权的“技术型制造+电商出口”企业，属于有成长性、有技术壁垒、对品牌与合规都很在意的客户。 • 机会属性：不是单点小工具客户，更适合作为“研发+制造+电商一体化数智化/信息化项目”，可以从某一强痛点切入（如：生产质检追溯、电商订单与库存一体化、研发/专利管理），再逐步扩展。 • 决策风格：既与科研院所、疾控中心长期合作，又频繁参与行业标准和政府项目，说明管理层对“长期投入+行业地位”有认知，对有行业案例、有方法论的解决方案型供应商更友好，但也会看重落地效果与性价比。',
                summary: '宁波大央科技是一家在“灭蚊/驱蚊”细分赛道里具技术和标准话语权的中大型制造+电商企业，现金流与成长性都不错，适合作为从“研发–制造–电商–合规”一体化数智化项目切入的标杆型客户。'
            },
            {
                id: 'event-2',
                title: '惠康客诉线上会议',
                startDate: '2025年7月13日 上午9:00',
                endDate: '2025年7月13日 上午10:00',
                date: '2025-07-13'
            }
        ];

        let events = JSON.parse(localStorage.getItem('events')) || [];
        const existingIds = new Set(events.map(e => e.id));
        hardcodedEvents.forEach(he => {
            if (!existingIds.has(he.id)) {
                events.push(he);
            }
        });

        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('migration_done', 'true');
    }

    function getStoredEvents() {
        return JSON.parse(localStorage.getItem('events')) || [];
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
            if (i === 2 && currentMonth === 6 && currentYear === 2025) { // July 2nd, 2025
                dayDiv.classList.add('today');
            }

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
                    addEventBtn.href = `add_event.html?date=${formattedDate}`;
                }
            });

            daysGrid.appendChild(dayDiv);
        }
    }

    function renderSchedule(day) {
        scheduleList.innerHTML = '';
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

            if (event.id) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.location.href = `add_event.html?id=${event.id}`;
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
            const timeMatch = event.startDate.match(/(\d{1,2}:\d{2})/)[0];
            startTimeDiv.textContent = timeMatch || 'N/A';
            itemTime.appendChild(startTimeDiv);

            const endTimeDiv = document.createElement('div');
            endTimeDiv.className = 'end-time';
            if (event.endDate) {
                const endTimeMatch = event.endDate.match(/(\d{1,2}:\d{2})/);
                if (endTimeMatch) {
                    endTimeDiv.textContent = endTimeMatch[0];
                }
            }
            itemTime.appendChild(endTimeDiv);

            item.appendChild(colorBar);
            item.appendChild(itemContent);

            // Add depart button if location contains '现场' or '公司'
            if (event.location && (event.location.includes('现场') || event.location.includes('公司'))) {
                const departButton = document.createElement('div');
                departButton.classList.add('depart-button');
                departButton.textContent = '出发';
                departButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent navigating to edit page
                window.location.href = `depart_options.html?date=${dateStr}`;
            });
                item.appendChild(departButton);
            }

            item.appendChild(itemTime);

            scheduleList.appendChild(item);
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
        const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:(上午|下午))?\s*(\d{1,2}):(\d{2})/);
        if (!match) return null;

        let [, year, month, day, ampm, hours, minutes] = match;
        year = parseInt(year);
        month = parseInt(month) - 1;
        day = parseInt(day);
        hours = parseInt(hours);
        minutes = parseInt(minutes);

        if (ampm === '下午' && hours !== 12) {
            hours += 12;
        }
        if (ampm === '上午' && hours === 12) {
            hours = 0;
        }

        return new Date(year, month, day, hours, minutes);
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

    function updateEventDataAfterDrop(draggingItem) {
        const orderedItemElements = [...scheduleList.querySelectorAll('.schedule-item')];
        const orderedIds = orderedItemElements.map(item => item.dataset.eventId);
        let storedEvents = getStoredEvents();
        const draggedEventId = draggingItem.dataset.eventId;

        const draggedEventIndex = orderedIds.indexOf(draggedEventId);
        const draggedEvent = storedEvents.find(e => e.id === draggedEventId);

        if (!draggedEvent) return;

        const startDateObj = parseScheduleDate(draggedEvent.startDate);
        const endDateObj = parseScheduleDate(draggedEvent.endDate);
        if (!startDateObj || !endDateObj) return;
        const duration = endDateObj.getTime() - startDateObj.getTime();

        if (draggedEventIndex < orderedIds.length - 1) {
            const nextEventId = orderedIds[draggedEventIndex + 1];
            const nextEvent = storedEvents.find(e => e.id === nextEventId);
            if (nextEvent) {
                const nextEventStartDate = parseScheduleDate(nextEvent.startDate);
                if (nextEventStartDate) {
                    const newEndDate = new Date(nextEventStartDate.getTime());
                    const newStartDate = new Date(newEndDate.getTime() - duration);
                    draggedEvent.endDate = formatScheduleDate(newEndDate);
                    draggedEvent.startDate = formatScheduleDate(newStartDate);
                }
            }
        } else if (draggedEventIndex > 0) {
            const prevEventId = orderedIds[draggedEventIndex - 1];
            const prevEvent = storedEvents.find(e => e.id === prevEventId);
            if (prevEvent) {
                const prevEventEndDate = parseScheduleDate(prevEvent.endDate);
                if (prevEventEndDate) {
                    const newStartDate = new Date(prevEventEndDate.getTime());
                    const newEndDate = new Date(newStartDate.getTime() + duration);
                    draggedEvent.startDate = formatScheduleDate(newStartDate);
                    draggedEvent.endDate = formatScheduleDate(newEndDate);
                }
            }
        }

        const eventToUpdateIndex = storedEvents.findIndex(e => e.id === draggedEventId);
        if (eventToUpdateIndex > -1) {
            storedEvents[eventToUpdateIndex] = draggedEvent;
        }

        storedEvents.sort((a, b) => {
            const aIndex = orderedIds.indexOf(a.id);
            const bIndex = orderedIds.indexOf(b.id);
            if (aIndex === -1 || bIndex === -1) return 0;
            return aIndex - bIndex;
        });

        localStorage.setItem('events', JSON.stringify(storedEvents));

        const day = new Date(draggedEvent.date).getDate();
        renderSchedule(day);
    }

    function initialize() {
        const urlParams = new URLSearchParams(window.location.search);
        const dateFromUrl = urlParams.get('date');

        if (dateFromUrl) {
            const [year, month, day] = dateFromUrl.split('-').map(Number);
            currentYear = year;
            currentMonth = month - 1;
            generateCalendar();
            renderSchedule(day);

            // Highlight the correct day in the calendar
            const currentSelected = daysGrid.querySelector('.today');
            if (currentSelected) {
                currentSelected.classList.remove('today');
            }
            const dayDivs = daysGrid.querySelectorAll('.day');
            dayDivs.forEach(div => {
                if (parseInt(div.textContent) === day) {
                    div.classList.add('today');
                }
            });

        } else {
            generateCalendar();
            renderSchedule(2); // Render for July 2nd, which is the hardcoded 'today'
        }
    }

    initialize();
});