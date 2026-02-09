document.addEventListener('DOMContentLoaded', function() {
    const batchSelectBtn = document.querySelector('.batch-select-btn');
    const backApprovalBtn = document.querySelector('.back-approval-btn');
    const checkboxes = document.querySelectorAll('.approval-list input[type="checkbox"]');
    const approvalList = document.querySelector('.approval-list');
    const pendingStatValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const approvedStatValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const passRateStatValue = document.querySelector('.stat-card:nth-child(3) .stat-value');

    // Function to update stats
    function updateStats() {
        const approvalItems = document.querySelectorAll('.approval-item');
        let pendingCount = 0;
        let approvedCount = 0;
        let rejectedCount = 0;

        approvalItems.forEach(item => {
            const status = item.getAttribute('data-status');
            if (status === 'pending') {
                pendingCount++;
            } else if (status === 'approved') {
                approvedCount++;
            } else if (status === 'rejected') {
                rejectedCount++;
            }
        });

        if (pendingStatValue) {
            pendingStatValue.textContent = pendingCount;
        }
        
        const totalProcessed = approvedCount + rejectedCount;
        const totalItems = pendingCount + approvedCount + rejectedCount;
        
        if (approvedStatValue) {
            approvedStatValue.textContent = totalProcessed;
        }
        
        if (passRateStatValue) {
            if (totalItems === 0) {
                passRateStatValue.textContent = '0%';
            } else {
                const passRate = Math.round((approvedCount / totalItems) * 10000) / 100;
                passRateStatValue.textContent = (Number.isInteger(passRate) ? passRate : passRate.toFixed(2)) + '%';
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
                    actionBtns.innerHTML = `
                        <button class="approve-btn">通过</button>
                        <button class="reject-btn">拒绝</button>
                    `;
                    
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

    // Initialize items with pending status
    const approvalItems = document.querySelectorAll('.approval-item');
    approvalItems.forEach(item => {
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

            const tabText = this.textContent.trim();
            if (tabText === '全部') {
                filterItems('all');
            } else if (tabText === '待审批') {
                filterItems('pending');
            } else if (tabText === '已批准') {
                filterItems('approved');
            } else if (tabText === '已拒绝') {
                filterItems('rejected');
            }
        });
    });

    // Event Delegation for Approve/Reject Buttons
    if (approvalList) {
        approvalList.addEventListener('click', function(e) {
            const target = e.target;
            
            if (target.classList.contains('approve-btn')) {
                handleApprove(target);
            } else if (target.classList.contains('reject-btn')) {
                handleReject(target);
            }
        });
    }

    function handleApprove(btn) {
        const allChecked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked) {
            if (confirm('是否确定通过？')) {
                checkboxes.forEach(cb => {
                    if (cb.checked) {
                        approveItem(cb.closest('.approval-item'));
                    }
                });
            }
        } else {
            if (confirm('是否确定通过此条申请？')) {
                approveItem(btn.closest('.approval-item'));
            }
        }
    }

    function handleReject(btn) {
        const allChecked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked) {
            if (confirm('是否确定拒绝？')) {
                checkboxes.forEach(cb => {
                    if (cb.checked) {
                        rejectItem(cb.closest('.approval-item'));
                    }
                });
            }
        } else {
            if (confirm('是否确定拒绝此条申请？')) {
                rejectItem(btn.closest('.approval-item'));
            }
        }
    }

    function approveItem(item) {
        const card = item.querySelector('.approval-card');
        const actionBtns = card.querySelector('.action-buttons');
        actionBtns.innerHTML = '<span style="color: #34c759; font-weight: bold; font-size: 14px;">已通过</span>';
        item.setAttribute('data-status', 'approved');
        updateStats();
    }

    function rejectItem(item) {
        const card = item.querySelector('.approval-card');
        const actionBtns = card.querySelector('.action-buttons');
        actionBtns.innerHTML = '<span style="color: #ff3b30; font-weight: bold; font-size: 14px;">已拒绝</span>';
        item.setAttribute('data-status', 'rejected');
        updateStats();
    }
});
