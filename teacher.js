// Teacher Dashboard JavaScript Module
class TeacherDashboard {
    constructor() {
        this.currentUser = null;
        this.attendanceData = null;
        this.resultsData = null;
        this.coursesData = null;
        this.usersData = null;
        this.selectedCourse = null;
        this.selectedDate = null;
        this.init();
    }

    init() {
        // Get current user
        this.currentUser = authManager.getCurrentUser();
        
        if (!this.currentUser || this.currentUser.role !== 'teacher') {
            window.location.href = 'index.html';
            return;
        }

        // Load data
        this.loadData();
        
        // Initialize dashboard
        this.initializeDashboard();
        this.setupEventListeners();
    }

    loadData() {
        this.attendanceData = studentPortal.getAttendanceData();
        this.resultsData = studentPortal.getResultsData();
        this.coursesData = studentPortal.getCoursesData();
        this.usersData = studentPortal.getUsersData();
    }

    initializeDashboard() {
        this.updateDashboardStats();
        this.loadRecentActivity();
    }

    setupEventListeners() {
        // Attendance course selection
        const attendanceCourse = document.getElementById('attendanceCourse');
        if (attendanceCourse) {
            attendanceCourse.addEventListener('change', (e) => {
                this.selectedCourse = e.target.value;
                this.updateAttendanceForm();
            });
        }

        // Attendance date selection
        const attendanceDate = document.getElementById('attendanceDate');
        if (attendanceDate) {
            // Set today's date as default
            attendanceDate.value = new Date().toISOString().split('T')[0];
            attendanceDate.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.updateAttendanceForm();
            });
        }

        // Marks course selection
        const marksCourse = document.getElementById('marksCourse');
        if (marksCourse) {
            marksCourse.addEventListener('change', (e) => {
                this.selectedCourse = e.target.value;
                this.updateMarksForm();
            });
        }

        // Assessment type selection
        const assessmentType = document.getElementById('assessmentType');
        if (assessmentType) {
            assessmentType.addEventListener('change', (e) => {
                this.selectedAssessmentType = e.target.value;
                this.updateMarksForm();
            });
        }

        // Students section
        const filterCourse = document.getElementById('filterCourse');
        if (filterCourse) {
            filterCourse.addEventListener('change', (e) => {
                this.filterStudentsByCourse(e.target.value);
            });
        }

        // Load students list
        this.loadStudentsList();
    }

    updateDashboardStats() {
        const teacherCourses = this.getTeacherCourses();
        const totalStudents = this.getTotalStudents();
        const pendingTasks = this.getPendingTasks();

        // Update stats
        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = totalStudents;
        }

        const totalCoursesElement = document.getElementById('totalCourses');
        if (totalCoursesElement) {
            totalCoursesElement.textContent = teacherCourses.length;
        }

        const pendingTasksElement = document.getElementById('pendingTasks');
        if (pendingTasksElement) {
            pendingTasksElement.textContent = pendingTasks;
        }
    }

    getTeacherCourses() {
        return this.coursesData.filter(course => course.teacher === this.currentUser.id);
    }

    getTotalStudents() {
        const teacherCourses = this.getTeacherCourses();
        const studentSet = new Set();
        
        teacherCourses.forEach(course => {
            course.students.forEach(studentId => studentSet.add(studentId));
        });
        
        return studentSet.size;
    }

    getPendingTasks() {
        // Simple implementation - count courses without recent attendance
        const teacherCourses = this.getTeacherCourses();
        let pendingTasks = 0;

        teacherCourses.forEach(course => {
            const courseAttendance = this.attendanceData[course.code] || {};
            const today = new Date().toISOString().split('T')[0];
            
            // Check if attendance was marked today
            let attendanceMarkedToday = false;
            Object.values(courseAttendance).forEach(studentAttendance => {
                if (studentAttendance.some(record => record.date === today)) {
                    attendanceMarkedToday = true;
                }
            });
            
            if (!attendanceMarkedToday) {
                pendingTasks++;
            }
        });

        return pendingTasks;
    }

    loadRecentActivity() {
        // This would typically load from a more sophisticated activity log
        // For now, we'll show static sample data
        const activityElement = document.getElementById('recentActivity');
        if (activityElement) {
            // Activity is already in HTML, just ensure it's visible
        }
    }

    updateAttendanceForm() {
        const attendanceForm = document.getElementById('attendanceForm');
        if (!attendanceForm || !this.selectedCourse || !this.selectedDate) {
            if (attendanceForm) attendanceForm.style.display = 'none';
            return;
        }

        // Show form
        attendanceForm.style.display = 'block';

        // Get students for the selected course
        const course = this.coursesData.find(c => c.code === this.selectedCourse);
        if (!course) return;

        const studentListElement = document.getElementById('studentAttendanceList');
        if (!studentListElement) return;

        // Get students data
        const students = this.usersData.filter(u => course.students.includes(u.id) && u.role === 'student');

        // Check existing attendance for this date
        const existingAttendance = this.attendanceData[this.selectedCourse] || {};
        
        studentListElement.innerHTML = students.map(student => {
            const studentAttendance = existingAttendance[student.id] || [];
            const todayAttendance = studentAttendance.find(record => record.date === this.selectedDate);
            const isPresent = todayAttendance ? todayAttendance.status === 'present' : false;

            return `
                <div class="student-attendance-item">
                    <div class="student-info">
                        <span class="student-name">${student.name}</span>
                        <span class="student-id">${student.id}</span>
                    </div>
                    <div class="attendance-controls">
                        <label class="attendance-radio">
                            <input type="radio" name="attendance_${student.id}" value="present" ${isPresent ? 'checked' : ''}>
                            <span>Present</span>
                        </label>
                        <label class="attendance-radio">
                            <input type="radio" name="attendance_${student.id}" value="absent" ${!isPresent ? 'checked' : ''}>
                            <span>Absent</span>
                        </label>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateMarksForm() {
        const marksForm = document.getElementById('marksForm');
        if (!marksForm || !this.selectedCourse || !this.selectedAssessmentType) {
            if (marksForm) marksForm.style.display = 'none';
            return;
        }

        // Show form
        marksForm.style.display = 'block';

        // Get students for the selected course
        const course = this.coursesData.find(c => c.code === this.selectedCourse);
        if (!course) return;

        const marksTableBody = document.getElementById('marksTableBody');
        if (!marksTableBody) return;

        // Get students data
        const students = this.usersData.filter(u => course.students.includes(u.id) && u.role === 'student');

        // Get existing marks
        const existingMarks = this.resultsData[this.selectedCourse] || {};

        marksTableBody.innerHTML = students.map(student => {
            const studentMarks = existingMarks[student.id];
            let currentMark = '';
            let currentGrade = '';

            if (studentMarks && studentMarks[this.selectedAssessmentType]) {
                if (Array.isArray(studentMarks[this.selectedAssessmentType])) {
                    currentMark = studentMarks[this.selectedAssessmentType][studentMarks[this.selectedAssessmentType].length - 1] || '';
                } else {
                    currentMark = studentMarks[this.selectedAssessmentType] || '';
                }
                
                if (currentMark) {
                    currentGrade = studentPortal.calculateGrade(parseInt(currentMark));
                }
            }

            return `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>
                        <input type="number" 
                               class="marks-input" 
                               data-student="${student.id}" 
                               value="${currentMark}"
                               min="0" 
                               max="100"
                               onchange="calculateStudentGrade('${student.id}')">
                    </td>
                    <td class="grade-cell" id="grade_${student.id}">${currentGrade}</td>
                </tr>
            `;
        }).join('');
    }

    loadStudentsList() {
        const studentsListElement = document.getElementById('studentsList');
        if (!studentsListElement) return;

        const teacherCourses = this.getTeacherCourses();
        const allStudents = new Set();
        
        teacherCourses.forEach(course => {
            course.students.forEach(studentId => allStudents.add(studentId));
        });

        const students = this.usersData.filter(u => allStudents.has(u.id) && u.role === 'student');

        if (students.length === 0) {
            studentsListElement.innerHTML = '<p>No students found</p>';
            return;
        }

        studentsListElement.innerHTML = `
            <div class="students-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Courses</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => `
                            <tr>
                                <td>${student.id}</td>
                                <td>${student.name}</td>
                                <td>${student.email}</td>
                                <td>${this.getStudentCoursesCount(student.id)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="viewStudentDetails('${student.id}')">View</button>
                                    <button class="btn btn-sm btn-primary" onclick="viewStudentProgress('${student.id}')">Progress</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getStudentCoursesCount(studentId) {
        return this.coursesData.filter(course => 
            course.teacher === this.currentUser.id && 
            course.students.includes(studentId)
        ).length;
    }

    filterStudentsByCourse(courseCode) {
        if (!courseCode) {
            this.loadStudentsList();
            return;
        }

        const studentsListElement = document.getElementById('studentsList');
        if (!studentsListElement) return;

        const course = this.coursesData.find(c => c.code === courseCode && c.teacher === this.currentUser.id);
        if (!course) return;

        const students = this.usersData.filter(u => course.students.includes(u.id) && u.role === 'student');

        studentsListElement.innerHTML = `
            <div class="students-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => `
                            <tr>
                                <td>${student.id}</td>
                                <td>${student.name}</td>
                                <td>${student.email}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="viewStudentDetails('${student.id}')">View</button>
                                    <button class="btn btn-sm btn-primary" onclick="viewStudentProgress('${student.id}')">Progress</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Global functions for teacher dashboard
function markAllPresent() {
    const radioButtons = document.querySelectorAll('input[type="radio"][value="present"]');
    radioButtons.forEach(radio => radio.checked = true);
}

function markAllAbsent() {
    const radioButtons = document.querySelectorAll('input[type="radio"][value="absent"]');
    radioButtons.forEach(radio => radio.checked = true);
}

function saveAttendance() {
    if (!window.teacherDashboard) return;

    const courseCode = window.teacherDashboard.selectedCourse;
    const date = window.teacherDashboard.selectedDate;
    
    if (!courseCode || !date) {
        studentPortal.showNotification('Please select course and date', 'error');
        return;
    }

    // Get all attendance radio buttons
    const attendanceData = {};
    const studentRadios = document.querySelectorAll('input[name^="attendance_"]');
    
    studentRadios.forEach(radio => {
        if (radio.checked) {
            const studentId = radio.name.replace('attendance_', '');
            attendanceData[studentId] = radio.value;
        }
    });

    // Save attendance data
    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendance[courseCode]) {
        attendance[courseCode] = {};
    }

    Object.keys(attendanceData).forEach(studentId => {
        if (!attendance[courseCode][studentId]) {
            attendance[courseCode][studentId] = [];
        }

        // Remove existing entry for this date
        attendance[courseCode][studentId] = attendance[courseCode][studentId].filter(
            record => record.date !== date
        );

        // Add new attendance record
        attendance[courseCode][studentId].push({
            date: date,
            status: attendanceData[studentId]
        });
    });

    localStorage.setItem('attendance', JSON.stringify(attendance));
    studentPortal.showNotification('Attendance saved successfully', 'success');
}

function clearAttendance() {
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => radio.checked = false);
}

function calculateStudentGrade(studentId) {
    const marksInput = document.querySelector(`input[data-student="${studentId}"]`);
    const gradeCell = document.getElementById(`grade_${studentId}`);
    
    if (marksInput && gradeCell) {
        const marks = parseInt(marksInput.value);
        if (marks >= 0 && marks <= 100) {
            const grade = studentPortal.calculateGrade(marks);
            gradeCell.textContent = grade;
        } else {
            gradeCell.textContent = '';
        }
    }
}

function calculateGrades() {
    const marksInputs = document.querySelectorAll('.marks-input');
    marksInputs.forEach(input => {
        const studentId = input.getAttribute('data-student');
        calculateStudentGrade(studentId);
    });
}

function saveMarks() {
    if (!window.teacherDashboard) return;

    const courseCode = window.teacherDashboard.selectedCourse;
    const assessmentType = window.teacherDashboard.selectedAssessmentType;
    
    if (!courseCode || !assessmentType) {
        studentPortal.showNotification('Please select course and assessment type', 'error');
        return;
    }

    // Get all marks inputs
    const marksInputs = document.querySelectorAll('.marks-input');
    const marksData = {};
    
    marksInputs.forEach(input => {
        const studentId = input.getAttribute('data-student');
        const marks = parseInt(input.value);
        
        if (marks >= 0 && marks <= 100) {
            marksData[studentId] = marks;
        }
    });

    // Save marks data
    const results = JSON.parse(localStorage.getItem('results') || '{}');
    
    if (!results[courseCode]) {
        results[courseCode] = {};
    }

    Object.keys(marksData).forEach(studentId => {
        if (!results[courseCode][studentId]) {
            results[courseCode][studentId] = {
                quiz: [],
                assignment: [],
                midterm: 0,
                final: 0
            };
        }

        if (assessmentType === 'quiz' || assessmentType === 'assignment') {
            // Add to array for quizzes and assignments
            results[courseCode][studentId][assessmentType].push(marksData[studentId]);
        } else {
            // Set directly for midterm and final
            results[courseCode][studentId][assessmentType] = marksData[studentId];
        }
    });

    localStorage.setItem('results', JSON.stringify(results));
    studentPortal.showNotification('Marks saved successfully', 'success');
}

function viewStudentDetails(studentId) {
    studentPortal.showNotification('Student details feature coming soon', 'info');
}

function viewStudentProgress(studentId) {
    studentPortal.showNotification('Student progress feature coming soon', 'info');
}

function generateReport() {
    studentPortal.showNotification('Report generation feature coming soon', 'info');
}

function downloadReport() {
    studentPortal.showNotification('PDF download feature coming soon', 'info');
}

// Initialize teacher dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('teacher-dashboard.html')) {
        window.teacherDashboard = new TeacherDashboard();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherDashboard;
}