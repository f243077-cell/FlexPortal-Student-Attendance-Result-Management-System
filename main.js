// Main JavaScript Module for Student Portal
class StudentPortal {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Get current user
        this.currentUser = authManager.getCurrentUser();

        // Initialize common functionality
        this.initializeNavigation();
        this.initializeCommonData();
        this.setupEventListeners();

        // Set current date
        this.updateCurrentDate();
    }

    initializeNavigation() {
        // Menu item click handlers
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update active menu item
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
        });

        const activeMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
    }

    initializeCommonData() {
        // Initialize default data if not exists
        this.initializeAttendanceData();
        this.initializeResultsData();
        this.initializeCoursesData();
    }

    initializeAttendanceData() {
        if (!localStorage.getItem('attendance')) {
            const defaultAttendance = {
                'CS-101': {
                    'student-1': [
                        { date: '2025-11-20', status: 'present' },
                        { date: '2025-11-18', status: 'present' },
                        { date: '2025-11-15', status: 'absent' }
                    ],
                    'student-2': [
                        { date: '2025-11-20', status: 'present' },
                        { date: '2025-11-18', status: 'absent' },
                        { date: '2025-11-15', status: 'present' }
                    ],
                    'student-3': [
                        { date: '2025-11-20', status: 'present' },
                        { date: '2025-11-18', status: 'present' },
                        { date: '2025-11-15', status: 'present' }
                    ]
                },
                'CS-201': {
                    'student-1': [
                        { date: '2024-11-19', status: 'present' },
                        { date: '2024-11-17', status: 'present' },
                        { date: '2024-11-14', status: 'present' }
                    ],
                    'student-2': [
                        { date: '2024-11-19', status: 'absent' },
                        { date: '2024-11-17', status: 'present' },
                        { date: '2024-11-14', status: 'present' }
                    ],
                    'student-3': [
                        { date: '2025-11-16', status: 'present' },
                        { date: '2025-11-18', status: 'present' },
                        { date: '2025-11-15', status: 'present' }
                    ]
                }
            };
            localStorage.setItem('attendance', JSON.stringify(defaultAttendance));
        }
    }

    initializeResultsData() {
        if (!localStorage.getItem('results')) {
            const defaultResults = {
                'CS-101': {
                    'student-1': {
                        quiz: [85, 90, 78],
                        assignment: [92, 88],
                        midterm: 85,
                        final: 0
                    },
                    'student-2': {
                        quiz: [90, 85, 82],
                        assignment: [90, 85],
                        midterm: 88,
                        final: 0
                    },
                    'student-3': {
                        quiz: [92, 80, 90],
                        assignment: [95, 92],
                        midterm: 87,
                        final: 0
                    }
                },
                'CS-201': {
                    'student-1': {
                        quiz: [80, 85, 88],
                        assignment: [87, 90],
                        midterm: 82,
                        final: 0
                    },
                    'student-2': {
                        quiz: [75, 80, 85],
                        assignment: [82, 88],
                        midterm: 79,
                        final: 0
                    },
                    'student-3': {
                        quiz: [92, 80, 90],
                        assignment: [95, 92],
                        midterm: 87,
                        final: 0
                    }
                }
            };
            localStorage.setItem('results', JSON.stringify(defaultResults));
        }
    }

    initializeCoursesData() {
        if (!localStorage.getItem('courses')) {
            const defaultCourses = [
                {
                    code: 'CS-101',
                    name: 'Introduction to Programming',
                    teacher: 'teacher-1',
                    credits: 3,
                    students: ['student-1', 'student-2', 'student-3']
                },
                {
                    code: 'CS-201',
                    name: 'Assembly Language',
                    teacher: 'teacher001',
                    credits: 3,
                    students: ['student-1', 'student-2','student-3']
                },
                {
                    code: 'MATH-201',
                    name: 'Discrete Mathematics',
                    teacher: 'teacher001',
                    credits: 3,
                    students: ['student-1', 'student-2', 'student-3']
                }
            ];
            localStorage.setItem('courses', JSON.stringify(defaultCourses));
        }
    }

    setupEventListeners() {
        // Common event listeners that work across all pages
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUserInterface();
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    updateUserInterface() {
        // Update user name in sidebar
        const userNameElements = document.querySelectorAll('#studentName, #teacherName, #adminName');
        userNameElements.forEach(element => {
            if (this.currentUser) {
                element.textContent = this.currentUser.name;
            }
        });

        // Update profile information
        this.updateProfileInfo();
    }

    updateProfileInfo() {
        if (!this.currentUser) return;

        // Update profile name
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = this.currentUser.name;
        }

        // Update profile email
        const profileEmail = document.getElementById('profileEmail');
        if (profileEmail) {
            profileEmail.textContent = this.currentUser.email;
        }

        // Update profile ID
        const profileId = document.getElementById('profileId');
        if (profileId) {
            profileId.textContent = `Student ID: ${this.currentUser.id}`;
        }

        // Update profile initials
        const profileInitials = document.getElementById('profileInitials');
        if (profileInitials) {
            const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            profileInitials.textContent = initials;
        }

        // Update other profile fields
        const profileProgram = document.getElementById('profileProgram');
        if (profileProgram && this.currentUser.program) {
            profileProgram.textContent = this.currentUser.program;
        }

        const profileSemester = document.getElementById('profileSemester');
        if (profileSemester && this.currentUser.semester) {
            profileSemester.textContent = this.currentUser.semester;
        }

        const profileYear = document.getElementById('profileYear');
        if (profileYear && this.currentUser.enrollmentYear) {
            profileYear.textContent = this.currentUser.enrollmentYear;
        }
    }

    updateCurrentDate() {
        const currentDateElements = document.querySelectorAll('#currentDate');
        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        currentDateElements.forEach(element => {
            element.textContent = today;
        });
    }

    handleResize() {
        // Handle responsive behavior
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (window.innerWidth <= 768) {
            // Mobile behavior
            if (sidebar && mainContent) {
                sidebar.style.position = 'relative';
                mainContent.style.marginLeft = '0';
            }
        } else {
            // Desktop behavior
            if (sidebar && mainContent) {
                sidebar.style.position = 'fixed';
                mainContent.style.marginLeft = '280px';
            }
        }
    }

    // Utility functions
    calculateAttendancePercentage(attendanceData) {
        if (!attendanceData || attendanceData.length === 0) {
            return 0;
        }

        const presentCount = attendanceData.filter(record => record.status === 'present').length;
        return Math.round((presentCount / attendanceData.length) * 100);
    }

    calculateGrade(totalMarks) {
        if (totalMarks >= 90) return 'A';
        if (totalMarks >= 80) return 'B';
        if (totalMarks >= 70) return 'C';
        if (totalMarks >= 60) return 'D';
        return 'F';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#48bb78';
                break;
            case 'error':
                notification.style.backgroundColor = '#e53e3e';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ed893d';
                break;
            default:
                notification.style.backgroundColor = '#4299e1';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Data management functions
    getAttendanceData(courseCode = null, studentId = null) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');

        if (courseCode && studentId) {
            return attendance[courseCode]?.[studentId] || [];
        }

        if (courseCode) {
            return attendance[courseCode] || {};
        }

        return attendance;
    }

    getResultsData(courseCode = null, studentId = null) {
        const results = JSON.parse(localStorage.getItem('results') || '{}');

        if (courseCode && studentId) {
            return results[courseCode]?.[studentId] || {};
        }

        if (courseCode) {
            return results[courseCode] || {};
        }

        return results;
    }

    getCoursesData() {
        return JSON.parse(localStorage.getItem('courses') || '[]');
    }

    getUsersData() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Save data functions
    saveAttendanceData(courseCode, studentId, attendanceData) {
        const attendance = this.getAttendanceData();

        if (!attendance[courseCode]) {
            attendance[courseCode] = {};
        }

        attendance[courseCode][studentId] = attendanceData;
        localStorage.setItem('attendance', JSON.stringify(attendance));
    }

    saveResultsData(courseCode, studentId, resultsData) {
        const results = this.getResultsData();

        if (!results[courseCode]) {
            results[courseCode] = {};
        }

        results[courseCode][studentId] = resultsData;
        localStorage.setItem('results', JSON.stringify(results));
    }
}

// Initialize the student portal
const studentPortal = new StudentPortal();

// Global utility functions
function showSection(sectionName) {
    studentPortal.showSection(sectionName);
}

function showNotification(message, type) {
    studentPortal.showNotification(message, type);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentPortal;
}