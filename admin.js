// Admin Dashboard JavaScript Module
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.usersData = null;
        this.coursesData = null;
        this.init();
    }

    init() {
        // Get current user
        this.currentUser = authManager.getCurrentUser();
        
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        // Load data
        this.loadData();
        
        // Initialize dashboard
        this.initializeDashboard();
        this.setupEventListeners();
        
        // Load course options for add user
        this.loadCourseOptions();
        
        // Load teacher options for add course
        this.loadTeacherOptions();
    }

    loadData() {
        this.usersData = studentPortal.getUsersData();
        this.coursesData = studentPortal.getCoursesData();
    }

    initializeDashboard() {
        this.updateDashboardStats();
        this.loadSystemActivity();
        this.loadSystemAlerts();
        this.loadUsersTable();
        this.loadCoursesTable();
    }

    setupEventListeners() {
        // User role filter
        const userRoleFilter = document.getElementById('userRoleFilter');
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', (e) => {
                this.filterUsersByRole(e.target.value);
            });
        }

        // Add user form
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
        }

        // Add course form
        const addCourseForm = document.getElementById('addCourseForm');
        if (addCourseForm) {
            addCourseForm.addEventListener('submit', (e) => this.handleAddCourse(e));
        }

        // System settings
        const attendanceSettingsBtn = document.querySelector('[onclick="saveAttendanceSettings()"]');
        if (attendanceSettingsBtn) {
            attendanceSettingsBtn.onclick = () => this.saveAttendanceSettings();
        }

        const gradeSettingsBtn = document.querySelector('[onclick="saveGradeSettings()"]');
        if (gradeSettingsBtn) {
            gradeSettingsBtn.onclick = () => this.saveGradeSettings();
        }

        const backupBtn = document.querySelector('[onclick="backupDatabase()"]');
        if (backupBtn) {
            backupBtn.onclick = () => this.backupDatabase();
        }

        const clearCacheBtn = document.querySelector('[onclick="clearCache()"]');
        if (clearCacheBtn) {
            clearCacheBtn.onclick = () => this.clearCache();
        }

        const maintenanceBtn = document.querySelector('[onclick="systemMaintenance()"]');
        if (maintenanceBtn) {
            maintenanceBtn.onclick = () => this.systemMaintenance();
        }
    }

    updateDashboardStats() {
        const totalStudents = this.usersData.filter(u => u.role === 'student').length;
        const totalTeachers = this.usersData.filter(u => u.role === 'teacher').length;
        const totalCourses = this.coursesData.length;
        const systemUptime = '99.8%';

        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = totalStudents;
        }

        const totalTeachersElement = document.getElementById('totalTeachers');
        if (totalTeachersElement) {
            totalTeachersElement.textContent = totalTeachers;
        }

        const totalCoursesElement = document.getElementById('totalCourses');
        if (totalCoursesElement) {
            totalCoursesElement.textContent = totalCourses;
        }

        const systemUptimeElement = document.getElementById('systemUptime');
        if (systemUptimeElement) {
            systemUptimeElement.textContent = systemUptime;
        }
    }

    loadSystemActivity() {
        // Activity log is static in HTML
    }

    loadSystemAlerts() {
        const alerts = [];
        const attendanceData = JSON.parse(localStorage.getItem('attendance') || '{}');
        let lowAttendanceCount = 0;

        Object.keys(attendanceData).forEach(courseCode => {
            Object.keys(attendanceData[courseCode]).forEach(studentId => {
                const attendanceRecords = attendanceData[courseCode][studentId];
                const attendancePercentage = this.calculateAttendancePercentage(attendanceRecords);
                if (attendancePercentage < 75) {
                    lowAttendanceCount++;
                }
            });
        });

        if (lowAttendanceCount > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowAttendanceCount} students have attendance below 75%`
            });
        }

        alerts.push({
            type: 'info',
            message: 'System maintenance scheduled for Sunday 2:00 AM'
        });

        const alertsListElement = document.getElementById('systemAlerts');
        if (alertsListElement) {
            alertsListElement.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <span class="alert-icon">${alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <span class="alert-text">${alert.message}</span>
                </div>
            `).join('');
        }
    }

    calculateAttendancePercentage(attendanceRecords) {
        if (!attendanceRecords || attendanceRecords.length === 0) return 100;
        const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
        return Math.round((presentCount / attendanceRecords.length) * 100);
    }

    loadUsersTable() {
        this.filterUsersByRole('');
    }

    filterUsersByRole(role) {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;

        let filteredUsers = this.usersData;
        if (role) {
            filteredUsers = this.usersData.filter(user => user.role === role);
        }

        usersTableBody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge active">Active</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editUser('${user.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    loadCoursesTable() {
        const coursesTableBody = document.getElementById('coursesTableBody');
        if (!coursesTableBody) return;

        coursesTableBody.innerHTML = this.coursesData.map(course => {
            const teacher = this.usersData.find(u => u.id === course.teacher);
            const teacherName = teacher ? teacher.name : 'Unassigned';
            
            return `
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>${teacherName}</td>
                    <td>${course.students.length}</td>
                    <td>${course.credits}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="editCourse('${course.code}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.code}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadCourseOptions() {
        // This would be used if we add course selection in user form
    }

    loadTeacherOptions() {
        const teacherSelect = document.getElementById('newCourseTeacher');
        if (!teacherSelect) return;

        const teachers = this.usersData.filter(u => u.role === 'teacher');
        
        teacherSelect.innerHTML = '<option value="">Select Teacher</option>' + 
            teachers.map(teacher => `
                <option value="${teacher.id}">${teacher.name}</option>
            `).join('');
    }

    handleAddUser(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('newUserName'),
            email: formData.get('newUserEmail'),
            role: formData.get('newUserRole'),
            password: formData.get('newUserPassword'),
            program: formData.get('newUserProgram') || 'Not Assigned',
            semester: formData.get('newUserSemester') || 'N/A',
            enrollmentYear: new Date().getFullYear()
        };

        // Validate email
        if (!userData.email.endsWith('@university.edu')) {
            studentPortal.showNotification('Please use university email address', 'error');
            return;
        }

        // Check if email already exists
        if (this.usersData.find(u => u.email === userData.email)) {
            studentPortal.showNotification('Email already exists', 'error');
            return;
        }

        // Generate unique ID
        const prefix = userData.role === 'student' ? 'student' : userData.role === 'teacher' ? 'teacher' : 'admin';
        const userId = prefix + '-' + Date.now().toString().slice(-6);
        userData.id = userId;

        // Add user to users array
        this.usersData.push(userData);
        localStorage.setItem('users', JSON.stringify(this.usersData));

        // If student, enroll in all courses
        if (userData.role === 'student') {
            this.enrollStudentInAllCourses(userId);
        }

        studentPortal.showNotification('User added successfully', 'success');
        this.closeAddUserModal();
        this.loadData();
        this.filterUsersByRole('');
        this.updateDashboardStats();
        e.target.reset();
    }

    enrollStudentInAllCourses(studentId) {
        // Enroll student in all existing courses
        this.coursesData.forEach(course => {
            if (!course.students.includes(studentId)) {
                course.students.push(studentId);
            }
        });
        localStorage.setItem('courses', JSON.stringify(this.coursesData));
    }

    handleAddCourse(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const courseData = {
            code: formData.get('newCourseCode').toUpperCase(),
            name: formData.get('newCourseName'),
            teacher: formData.get('newCourseTeacher'),
            credits: parseInt(formData.get('newCourseCredits')),
            students: []
        };

        // Check if course code already exists
        if (this.coursesData.find(c => c.code === courseData.code)) {
            studentPortal.showNotification('Course code already exists', 'error');
            return;
        }

        // Get all students and enroll them automatically
        const allStudents = this.usersData.filter(u => u.role === 'student');
        courseData.students = allStudents.map(s => s.id);

        // Add course
        this.coursesData.push(courseData);
        localStorage.setItem('courses', JSON.stringify(this.coursesData));

        studentPortal.showNotification('Course added successfully. All students enrolled automatically.', 'success');
        this.closeAddCourseModal();
        this.loadData();
        this.loadCoursesTable();
        this.updateDashboardStats();
        e.target.reset();
    }

    saveAttendanceSettings() {
        const threshold = document.getElementById('attendanceThreshold').value;
        const interval = document.getElementById('attendanceCheckInterval').value;

        const settings = {
            threshold: parseInt(threshold),
            interval: parseInt(interval)
        };

        localStorage.setItem('attendanceSettings', JSON.stringify(settings));
        studentPortal.showNotification('Attendance settings saved', 'success');
    }

    saveGradeSettings() {
        const passingGrade = document.getElementById('passingGrade').value;

        const settings = {
            passingGrade: parseInt(passingGrade)
        };

        localStorage.setItem('gradeSettings', JSON.stringify(settings));
        studentPortal.showNotification('Grade settings saved', 'success');
    }

    backupDatabase() {
        const backup = {
            users: this.usersData,
            courses: this.coursesData,
            attendance: JSON.parse(localStorage.getItem('attendance') || '{}'),
            results: JSON.parse(localStorage.getItem('results') || '{}'),
            settings: {
                attendance: JSON.parse(localStorage.getItem('attendanceSettings') || '{}'),
                grade: JSON.parse(localStorage.getItem('gradeSettings') || '{}')
            },
            timestamp: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-portal-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        studentPortal.showNotification('Database backup created', 'success');
    }

    clearCache() {
        const essentialData = {
            users: localStorage.getItem('users'),
            courses: localStorage.getItem('courses'),
            attendance: localStorage.getItem('attendance'),
            results: localStorage.getItem('results'),
            currentUser: localStorage.getItem('currentUser')
        };

        localStorage.clear();

        Object.keys(essentialData).forEach(key => {
            if (essentialData[key]) {
                localStorage.setItem(key, essentialData[key]);
            }
        });

        studentPortal.showNotification('Cache cleared successfully', 'success');
    }

    systemMaintenance() {
        if (confirm('Are you sure you want to perform system maintenance? This may temporarily affect system performance.')) {
            studentPortal.showNotification('System maintenance started', 'info');
            
            setTimeout(() => {
                studentPortal.showNotification('System maintenance completed', 'success');
            }, 3000);
        }
    }

    generateSystemReport() {
        const reportType = document.getElementById('systemReportType').value;
        const dateRange = document.getElementById('reportDateRange').value;

        if (!reportType) {
            studentPortal.showNotification('Please select a report type', 'error');
            return;
        }

        // Generate report based on type
        let reportData = {};
        
        switch(reportType) {
            case 'user-activity':
                reportData = this.generateUserActivityReport(dateRange);
                break;
            case 'system-performance':
                reportData = this.generateSystemPerformanceReport(dateRange);
                break;
            case 'attendance-summary':
                reportData = this.generateAttendanceSummaryReport(dateRange);
                break;
            case 'grade-analysis':
                reportData = this.generateGradeAnalysisReport(dateRange);
                break;
        }

        this.downloadSystemReport(reportData, reportType);
    }

    generateUserActivityReport(dateRange) {
        return {
            title: 'User Activity Report',
            dateRange: dateRange,
            totalUsers: this.usersData.length,
            students: this.usersData.filter(u => u.role === 'student').length,
            teachers: this.usersData.filter(u => u.role === 'teacher').length,
            admins: this.usersData.filter(u => u.role === 'admin').length,
            generatedAt: new Date().toISOString()
        };
    }

    generateSystemPerformanceReport(dateRange) {
        return {
            title: 'System Performance Report',
            dateRange: dateRange,
            uptime: '99.8%',
            totalCourses: this.coursesData.length,
            totalStudents: this.usersData.filter(u => u.role === 'student').length,
            averageClassSize: Math.round(this.coursesData.reduce((sum, c) => sum + c.students.length, 0) / this.coursesData.length),
            generatedAt: new Date().toISOString()
        };
    }

    generateAttendanceSummaryReport(dateRange) {
        const attendanceData = JSON.parse(localStorage.getItem('attendance') || '{}');
        let totalRecords = 0;
        let presentRecords = 0;

        Object.values(attendanceData).forEach(courseAttendance => {
            Object.values(courseAttendance).forEach(studentRecords => {
                totalRecords += studentRecords.length;
                presentRecords += studentRecords.filter(r => r.status === 'present').length;
            });
        });

        return {
            title: 'Attendance Summary Report',
            dateRange: dateRange,
            totalRecords: totalRecords,
            presentRecords: presentRecords,
            absentRecords: totalRecords - presentRecords,
            overallAttendanceRate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0,
            generatedAt: new Date().toISOString()
        };
    }

    generateGradeAnalysisReport(dateRange) {
        const resultsData = JSON.parse(localStorage.getItem('results') || '{}');
        let gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        let totalGrades = 0;

        Object.values(resultsData).forEach(courseResults => {
            Object.values(courseResults).forEach(studentResults => {
                // Calculate current grade
                let totalMarks = 0;
                let components = 0;

                if (studentResults.quiz && studentResults.quiz.length > 0) {
                    totalMarks += studentResults.quiz.reduce((a, b) => a + b, 0) / studentResults.quiz.length * 0.2;
                    components++;
                }
                if (studentResults.assignment && studentResults.assignment.length > 0) {
                    totalMarks += studentResults.assignment.reduce((a, b) => a + b, 0) / studentResults.assignment.length * 0.3;
                    components++;
                }
                if (studentResults.midterm > 0) {
                    totalMarks += studentResults.midterm * 0.25;
                    components++;
                }

                if (components > 0) {
                    const grade = studentPortal.calculateGrade(Math.round(totalMarks));
                    gradeDistribution[grade]++;
                    totalGrades++;
                }
            });
        });

        return {
            title: 'Grade Analysis Report',
            dateRange: dateRange,
            gradeDistribution: gradeDistribution,
            totalGrades: totalGrades,
            generatedAt: new Date().toISOString()
        };
    }

    downloadSystemReport(reportData, reportType) {
        const reportText = `
===========================================
${reportData.title}
===========================================

Date Range: ${reportData.dateRange}
Generated: ${new Date(reportData.generatedAt).toLocaleString()}

${JSON.stringify(reportData, null, 2)}

===========================================
        `;

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);

        studentPortal.showNotification('Report generated and downloaded successfully', 'success');
    }

    closeAddUserModal() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAddCourseModal() {
        const modal = document.getElementById('addCourseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showAddUserModal() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    showAddCourseModal() {
        this.loadTeacherOptions();
        const modal = document.getElementById('addCourseModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

// Global functions
function showAddUserModal() {
    if (window.adminDashboard) {
        window.adminDashboard.showAddUserModal();
    }
}

function closeAddUserModal() {
    if (window.adminDashboard) {
        window.adminDashboard.closeAddUserModal();
    }
}

function showAddCourseModal() {
    if (window.adminDashboard) {
        window.adminDashboard.showAddCourseModal();
    }
}

function closeAddCourseModal() {
    if (window.adminDashboard) {
        window.adminDashboard.closeAddCourseModal();
    }
}

function editUser(userId) {
    studentPortal.showNotification('Edit user feature coming soon', 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        studentPortal.showNotification('User deleted successfully', 'success');
        if (window.adminDashboard) {
            window.adminDashboard.loadData();
            window.adminDashboard.filterUsersByRole('');
            window.adminDashboard.updateDashboardStats();
        }
    }
}

function editCourse(courseCode) {
    studentPortal.showNotification('Edit course feature coming soon', 'info');
}

function deleteCourse(courseCode) {
    if (confirm('Are you sure you want to delete this course?')) {
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const filteredCourses = courses.filter(c => c.code !== courseCode);
        localStorage.setItem('courses', JSON.stringify(filteredCourses));
        
        studentPortal.showNotification('Course deleted successfully', 'success');
        if (window.adminDashboard) {
            window.adminDashboard.loadData();
            window.adminDashboard.loadCoursesTable();
            window.adminDashboard.updateDashboardStats();
        }
    }
}

function saveAttendanceSettings() {
    if (window.adminDashboard) {
        window.adminDashboard.saveAttendanceSettings();
    }
}

function saveGradeSettings() {
    if (window.adminDashboard) {
        window.adminDashboard.saveGradeSettings();
    }
}

function backupDatabase() {
    if (window.adminDashboard) {
        window.adminDashboard.backupDatabase();
    }
}

function clearCache() {
    if (window.adminDashboard) {
        window.adminDashboard.clearCache();
    }
}

function systemMaintenance() {
    if (window.adminDashboard) {
        window.adminDashboard.systemMaintenance();
    }
}

function generateSystemReport() {
    if (window.adminDashboard) {
        window.adminDashboard.generateSystemReport();
    }
}

function downloadSystemReport() {
    if (window.adminDashboard) {
        window.adminDashboard.generateSystemReport();
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        window.adminDashboard = new AdminDashboard();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}