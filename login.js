document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const roleDisplay = document.getElementById('role-display');
    const errorMessage = document.getElementById('error-message');

    // Role mapping based on username
    const userRoles = {
        'admin': 'Admin User (System Administrator)',
        'exec': 'Executive User (General Manager/Executive)',
        'manager': 'Manager User (Department Manager)',
        'user': 'User (Regular User)'
    };
    
    // Simple role codes for internal logic
    const roleCodes = {
        'admin': 'admin',
        'exec': 'executive',
        'manager': 'manager',
        'user': 'user'
    };

    // Auto-fill role when username changes
    usernameInput.addEventListener('input', function() {
        const username = this.value.trim().toLowerCase();
        if (userRoles[username]) {
            roleDisplay.value = userRoles[username];
        } else {
            roleDisplay.value = '';
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        
        // Simple authentication (for demo purposes, password same as username or '123456')
        if (userRoles[username]) {
            // Check password (simplified)
            if (password === username || password === '123456') {
                // Login successful
                const roleCode = roleCodes[username];
                const roleName = userRoles[username];
                
                // Save to localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    role: roleCode,
                    roleName: roleName,
                    loginTime: new Date().toISOString()
                }));
                
                // Redirect to main page
                window.location.href = 'index.html';
            } else {
                errorMessage.textContent = '密码错误 (测试密码为用户名或 123456)';
            }
        } else {
            errorMessage.textContent = '用户名不存在';
        }
    });
});
