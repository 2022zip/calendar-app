document.addEventListener('DOMContentLoaded', function() {
    const batchSelectBtn = document.querySelector('.batch-select-btn');
    const backApprovalBtn = document.querySelector('.back-approval-btn');
    const checkboxes = document.querySelectorAll('.approval-list input[type="checkbox"]');
    const approvalList = document.querySelector('.approval-list');
    const pendingStatValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const approvedStatValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const passRateStatValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
    const fabContainer = document.querySelector('.fab-container');

    // Function to check visibility of FAB
    function updateFabVisibility() {
        if (!fabContainer) return;
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (anyChecked) {
            fabContainer.style.display = 'flex';
        } else {
            fabContainer.style.display = 'none';
        }
    }

    // Function to update stats
    function updateStats() {
        const approvalItems = document.querySelectorAll('.approval-item');
        let pendingCount = 0;
        let approvedCount = 0;
        let rejectedCount = 0;
        
        let totalExpected = 0;
        let totalAbnormal = 0;

        approvalItems.forEach(item => {
            const status = item.getAttribute('data-status');
            if (status === 'pending') {
                pendingCount++;
            } else if (status === 'approved') {
                approvedCount++;
            } else if (status === 'rejected') {
                rejectedCount++;
            }
            
            // Calculate stats for ratio
            const details = item.querySelectorAll('.detail-item');
            details.forEach(d => {
                const labelEl = d.querySelector('.label');
                const valueEl = d.querySelector('.value');
                if (labelEl && valueEl) {
                    const label = labelEl.textContent.trim();
                    const valText = valueEl.textContent.trim();
                    const val = parseInt(valText);
                    if (!isNaN(val)) {
                        if (label === '应打卡次数') totalExpected += val;
                        if (label === '异常打卡次数') totalAbnormal += val;
                    }
                }
            });
        });

        if (pendingStatValue) {
            pendingStatValue.textContent = pendingCount;
        }
        
        const totalProcessed = approvedCount + rejectedCount;
        
        if (approvedStatValue) {
            approvedStatValue.textContent = totalProcessed;
        }
        
        if (passRateStatValue) {
            if (totalExpected === 0) {
                passRateStatValue.textContent = '0%';
            } else {
                const ratio = Math.round((totalAbnormal / totalExpected) * 100);
                passRateStatValue.textContent = ratio + '%';
            }
        }
    }

    // Batch Select Logic
    if (batchSelectBtn) {
        batchSelectBtn.addEventListener('click', function() {
            // Check if all are currently checked
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            // Toggle selection
            const newState = !allChecked;
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = newState;
            });

            updateFabVisibility();
        });
    }

    // Back to Approval / Reset Logic
    if (backApprovalBtn) {
        backApprovalBtn.addEventListener('click', function() {
            let hasCheckedItems = false;
            
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    hasCheckedItems = true;
                    // Reset Logic
                    const item = cb.closest('.approval-item');
                    const card = item.querySelector('.approval-card');
                    const actionBtns = card.querySelector('.action-buttons');
                    
                    // Restore buttons
                    if (actionBtns) {
                        actionBtns.innerHTML = `
                            <button class="approve-btn">通过</button>
                            <button class="reject-btn">拒绝</button>
                        `;
                    }
                    
                    // Reset status
                    item.setAttribute('data-status', 'pending');
                }
            });

            if (!hasCheckedItems) {
                // If nothing checked, navigate to index
                window.location.href = 'index.html';
            } else {
                // Optional: Uncheck items after reset? 
                // User didn't specify, but usually "reset" implies clearing selection too or keeping it to show effect.
                // Let's keep selection so user sees what changed, or uncheck?
                // Given "return to state of Figure 3", Figure 3 usually has unchecked boxes initially.
                // Let's uncheck them to be clean.
                checkboxes.forEach(cb => cb.checked = false);
                
                // Update stats after reset
                updateStats();
            }
        });
    }

    // Event Delegation for Checkbox Changes and Card Clicks
    if (approvalList) {
        approvalList.addEventListener('click', function(e) {
            const target = e.target;
            
            // Handle Checkbox Change (delegated)
            if (target.type === 'checkbox') {
                updateFabVisibility();
                return;
            }

            // Handle Card Click (Navigation)
            // Navigate if clicked on approval-card or its children, but NOT if clicked on checkbox or its wrapper
            const card = target.closest('.approval-card');
            const checkboxWrapper = target.closest('.checkbox-wrapper');
            
            if (card && !checkboxWrapper) {
                // Get User Name to pass to detail page
                const userNameEl = card.querySelector('.user-name');
                const userName = userNameEl ? userNameEl.textContent.trim() : 'Unknown';
                
                // Navigate to detail page
                window.location.href = `approval_detail.html?user=${encodeURIComponent(userName)}`;
            }
        });
        
        // Also listen for change events for checkboxes specifically (sometimes click doesn't catch all state changes reliably for checkboxes depending on browser/framework)
        approvalList.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox') {
                updateFabVisibility();
            }
        });
    }

    // Initialize items with pending status
    const approvalItems = document.querySelectorAll('.approval-item');
    approvalItems.forEach(item => {
        // Check localStorage for approved status
        const userNameEl = item.querySelector('.user-name');
        if (userNameEl) {
            const userName = userNameEl.textContent.trim();
            const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
            
            if (approvedUsers.includes(userName)) {
                // Apply approved state
                approveItemBatch(item);
                return; // Skip setting pending
            }
        }

        if (!item.hasAttribute('data-status')) {
            item.setAttribute('data-status', 'pending');
        }
    });
    
    // Initial Stats Update
    updateStats();

    // Filter Logic
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    function filterItems(status) {
        approvalItems.forEach(item => {
            const itemStatus = item.getAttribute('data-status');
            if (status === 'all') {
                item.style.display = 'flex';
            } else if (status === 'pending') {
                item.style.display = itemStatus === 'pending' ? 'flex' : 'none';
            } else if (status === 'approved') {
                item.style.display = itemStatus === 'approved' ? 'flex' : 'none';
            } else if (status === 'rejected') {
                item.style.display = itemStatus === 'rejected' ? 'flex' : 'none';
            }
        });
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked
            this.classList.add('active');

            // Reset all checkboxes and hide FAB when switching tabs
            checkboxes.forEach(cb => cb.checked = false);
            updateFabVisibility();

            const tabText = this.textContent.trim();
            if (tabText === '全部') {
                filterItems('all');
            } else if (tabText === '待审批') {
                filterItems('pending');
            } else if (tabText === '已批准') {
                filterItems('approved');
            }
        });
    });

    // Batch Approve Button Logic
    const batchApproveBtn = document.querySelector('.batch-approve-btn');
    if (batchApproveBtn) {
        batchApproveBtn.addEventListener('click', function() {
            let hasChecked = false;
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    hasChecked = true;
                    const item = cb.closest('.approval-item');
                    approveItemBatch(item);
                }
            });

            if (!hasChecked) {
                alert('请先选择要批阅的项目');
            } else {
                // Clear selection after approval
                checkboxes.forEach(cb => cb.checked = false);
                updateFabVisibility();
            }
        });
    }

    function approveItemBatch(item) {
        // Create status badge if not exists, or replace existing action buttons/status
        const cardHeader = item.querySelector('.card-header');
        
        // Remove existing badge if any
        const existingBadge = cardHeader.querySelector('.status-badge');
        if (existingBadge) existingBadge.remove();

        // Create new badge
        const badge = document.createElement('div');
        badge.className = 'status-badge';
        badge.textContent = '已批阅';
        
        cardHeader.appendChild(badge);
        
        item.setAttribute('data-status', 'approved');
        
        // Disable checkbox
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.disabled = true;
            checkbox.checked = false; // Uncheck if it was checked
        }

        updateStats();
    }
});
