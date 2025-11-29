// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.redirectToDashboard();
        }

        // Initialize default users if not exists
        if (!localStorage.getItem('users')) {
            this.initializeDefaultUsers();
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    initializeDefaultUsers() {
        const defaultUsers = [
            {
                id: 'admin',
                name: 'System Administrator',
                email: 'admin@university.edu',
                password: 'admin123',
                role: 'admin',
                program: 'System Administration',
                semester: 'N/A',
                enrollmentYear: '2020'
            },
            {
                id: 'teacher001',
                name: 'Prof. Johnson',
                email: 'johnson@university.edu',
                password: 'teacher123',
                role: 'teacher',
                program: 'Computer Science',
                semester: 'N/A',
                enrollmentYear: '2015'
            },
            {
                id: 'student-1',
                name: 'Muhammad Faizan',
                email: 'faizan@university.edu',
                password: 'student123',
                role: 'student',
                program: 'Computer Science',
                semester: 'Fall 2025',
                enrollmentYear: '2024'
            },
            {
                id: 'student-2',
                name: 'Usman Ghani',
                email: 'usman@university.edu',
                password: 'student123',
                role: 'student',
                program: 'Computer Science',
                semester: 'Fall 2025',
                enrollmentYear: '2024'
            },
            {
                id: 'student-3',
                name: 'Tanzeel Hussain',
                email: 'tanzeel@university.edu',
                password: 'student123',
                role: 'student',
                program: 'Computer Science',
                semester: 'Fall 2025',
                enrollmentYear: '2024'
            }
        ];

        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Set current date
        const currentDateElements = document.querySelectorAll('#currentDate');
        currentDateElements.forEach(element => {
            element.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        });
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Validate input
        if (!email || !password || !role) {
            this.showError('Please fill in all fields');
            return;
        }

        // Check if email is university email
        if (!email.endsWith('@university.edu')) {
            this.showError('Please use your university email address');
            return;
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user by email and password
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.role === role
        );

        if (user) {
            // Successful login
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.redirectToDashboard();
        } else {
            // Failed login
            this.showError('Invalid email, password, or role');
        }
    }

    handleLogout(e) {
        e.preventDefault();
        
        // Clear current user
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }

    redirectToDashboard() {
        if (!this.currentUser) return;

        const role = this.currentUser.role;
        let dashboardUrl;

        switch (role) {
            case 'student':
                dashboardUrl = 'student-dashboard.html';
                break;
            case 'teacher':
                dashboardUrl = 'teacher-dashboard.html';
                break;
            case 'admin':
                dashboardUrl = 'admin-dashboard.html';
                break;
            default:
                dashboardUrl = 'index.html';
        }

        // Only redirect if not already on the correct dashboard
        if (!window.location.pathname.includes(dashboardUrl)) {
            window.location.href = dashboardUrl;
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorElement.classList.remove('show');
            }, 5000);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check user role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Update user profile
    updateUserProfile(userId, updates) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.currentUser, ...updates };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            return true;
        }
        
        return false;
    }

    // Get all users (admin only)
    getAllUsers() {
        if (!this.hasRole('admin')) {
            return [];
        }
        
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Add new user (admin only)
    addUser(userData) {
        if (!this.hasRole('admin')) {
            return false;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            return false;
        }
        
        // Generate unique ID
        const newId = userData.role + '_' + Date.now();
        const newUser = {
            id: newId,
            ...userData
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return true;
    }

    // Delete user (admin only)
    deleteUser(userId) {
        if (!this.hasRole('admin')) {
            return false;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => u.id !== userId);
        
        if (filteredUsers.length !== users.length) {
            localStorage.setItem('users', JSON.stringify(filteredUsers));
            return true;
        }
        
        return false;
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}