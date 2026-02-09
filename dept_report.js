document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const weeklyReport = document.getElementById('weekly-report');
    const monthlyReport = document.getElementById('monthly-report');
    const avgTripDaysElem = document.getElementById('avg-trip-days');
    const avgCheckinCountElem = document.getElementById('avg-checkin-count');
    const abnormalRatioElem = document.getElementById('abnormal-ratio');
    
    // Initial setup
    // Check which tab has 'active' class or default to "本周周报"
    let activeTab = document.querySelector('.filter-tab.active');
    let initialTabText = activeTab ? activeTab.textContent.trim() : '本周周报';
    
    filterSections(initialTabText);
    updateStats(initialTabText);

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked
            this.classList.add('active');

            const tabText = this.textContent.trim();
            filterSections(tabText);
            updateStats(tabText);
        });
    });

    function filterSections(tabText) {
        if (tabText === '全部') {
            if (weeklyReport) weeklyReport.style.display = 'block';
            if (monthlyReport) monthlyReport.style.display = 'block';
        } else if (tabText === '本周周报') {
            if (weeklyReport) weeklyReport.style.display = 'block';
            if (monthlyReport) monthlyReport.style.display = 'none';
        } else if (tabText === '本月报表') {
            if (weeklyReport) weeklyReport.style.display = 'none';
            if (monthlyReport) monthlyReport.style.display = 'block';
        } else if (tabText === '历史数据') {
            if (weeklyReport) weeklyReport.style.display = 'none';
            if (monthlyReport) monthlyReport.style.display = 'none';
        }
    }

    function updateStats(tabText) {
        let sourceContainer = null;
        if (tabText === '全部' || tabText === '本周周报') {
            sourceContainer = weeklyReport;
        } else if (tabText === '本月报表') {
            sourceContainer = monthlyReport;
        }
        
        if (!sourceContainer) return;

        // Common variables for calculating totals
        let totalTripDays = 0;
        let tripUserCount = 0;
        let totalExpectedCheckins = 0;
        let expectedCheckinUserCount = 0;
        let totalAbnormalCheckins = 0;
        
        // Iterate through all user cards to gather data
        const userCards = sourceContainer.querySelectorAll('.user-card');
        
        userCards.forEach(card => {
            const statItems = card.querySelectorAll('.stat-item');
            statItems.forEach(item => {
                const labelEl = item.querySelector('.stat-label-box');
                const valueEl = item.querySelector('.stat-value-box');
                
                if (labelEl && valueEl) {
                    const label = labelEl.textContent.trim();
                    const valueStr = valueEl.textContent.trim();
                    const value = parseFloat(valueStr);
                    
                    if (!isNaN(value)) {
                        if (label === '出差天數') {
                            totalTripDays += value;
                            tripUserCount++;
                        } else if (label === '应打卡次数') {
                            totalExpectedCheckins += value;
                            expectedCheckinUserCount++;
                        } else if (label === '异常打卡次数') {
                            totalAbnormalCheckins += value;
                        }
                    }
                }
            });
        });

        // Calculate "下屬平均出差天數"
        if (avgTripDaysElem) {
            if (tripUserCount > 0) {
                const avg = totalTripDays / tripUserCount;
                // User requested 4.6 for (5+4+5)/3 = 14/3 = 4.666...
                // Using floor logic to match user's explicit "4.6"
                avgTripDaysElem.textContent = (Math.floor(avg * 10) / 10).toFixed(1);
            } else {
                avgTripDaysElem.textContent = '0';
            }
        }

        // Calculate "下屬平均应打卡次数"
        if (avgCheckinCountElem) {
            if (expectedCheckinUserCount > 0) {
                const avg = totalExpectedCheckins / expectedCheckinUserCount;
                // User requested 33.33 for (35+40+25)/3 = 100/3 = 33.333...
                avgCheckinCountElem.textContent = avg.toFixed(2);
            } else {
                avgCheckinCountElem.textContent = '0';
            }
        }

        // Calculate "异常打卡比例"
        // Formula: Total Abnormal / (Total Abnormal + Total Expected)
        // User example: (19+11+2)/(19+11+2+35+40+25) = 32/132 = 24.2%
        if (abnormalRatioElem) {
            const denominator = totalAbnormalCheckins + totalExpectedCheckins;
            if (denominator > 0) {
                const ratio = (totalAbnormalCheckins / denominator) * 100;
                abnormalRatioElem.textContent = ratio.toFixed(1) + '%';
            } else {
                abnormalRatioElem.textContent = '0%';
            }
        }
    }
});
