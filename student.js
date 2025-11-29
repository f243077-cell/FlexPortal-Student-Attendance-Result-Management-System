// Student Dashboard JavaScript Module
class StudentDashboard {
    constructor() {
        this.currentUser = null;
        this.attendanceData = null;
        this.resultsData = null;
        this.coursesData = null;
        this.init();
    }

    init() {
        // Get current user
        this.currentUser = authManager.getCurrentUser();
        
        if (!this.currentUser || this.currentUser.role !== 'student') {
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
    }

    initializeDashboard() {
        this.updateDashboardStats();
        this.loadRecentResults();
        this.loadAlerts();
    }

    setupEventListeners() {
        // Attendance section
        const attendanceSection = document.getElementById('attendance-section');
        if (attendanceSection) {
            this.loadAttendanceData();
        }

        // Results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            this.loadResultsData();
        }

        // Course selection for detailed marks
        const gradeSummary = document.getElementById('gradeSummary');
        if (gradeSummary) {
            this.loadGradeSummary();
        }
    }

    updateDashboardStats() {
        // Calculate overall attendance
        const overallAttendance = this.calculateOverallAttendance();
        const overallAttendanceElement = document.getElementById('overallAttendance');
        if (overallAttendanceElement) {
            overallAttendanceElement.textContent = overallAttendance + '%';
        }

        // Count total courses
        const totalCourses = this.getStudentCourses().length;
        const totalCoursesElement = document.getElementById('totalCourses');
        if (totalCoursesElement) {
            totalCoursesElement.textContent = totalCourses;
        }
    }

    calculateOverallAttendance() {
        const studentCourses = this.getStudentCourses();
        let totalClasses = 0;
        let attendedClasses = 0;

        studentCourses.forEach(course => {
            const courseAttendance = this.attendanceData[course.code]?.[this.currentUser.id] || [];
            totalClasses += courseAttendance.length;
            attendedClasses += courseAttendance.filter(record => record.status === 'present').length;
        });

        if (totalClasses === 0) return 0;
        return Math.round((attendedClasses / totalClasses) * 100);
    }

    getStudentCourses() {
        return this.coursesData.filter(course => 
            course.students.includes(this.currentUser.id)
        );
    }

    loadRecentResults() {
        const recentResultsElement = document.getElementById('recentResults');
        if (!recentResultsElement) return;

        const studentCourses = this.getStudentCourses();
        const recentResults = [];

        studentCourses.forEach(course => {
            const courseResults = this.resultsData[course.code]?.[this.currentUser.id];
            if (courseResults) {
                // Get the most recent assessment
                const assessments = [];
                
                if (courseResults.quiz && courseResults.quiz.length > 0) {
                    assessments.push({
                        type: 'Quiz',
                        marks: courseResults.quiz[courseResults.quiz.length - 1],
                        course: course.code
                    });
                }
                
                if (courseResults.assignment && courseResults.assignment.length > 0) {
                    assessments.push({
                        type: 'Assignment',
                        marks: courseResults.assignment[courseResults.assignment.length - 1],
                        course: course.code
                    });
                }
                
                if (courseResults.midterm > 0) {
                    assessments.push({
                        type: 'Midterm',
                        marks: courseResults.midterm,
                        course: course.code
                    });
                }

                recentResults.push(...assessments);
            }
        });

        // Sort by most recent and take top 5
        recentResults.sort((a, b) => b.marks - a.marks);
        const topResults = recentResults.slice(0, 5);

        if (topResults.length > 0) {
            recentResultsElement.innerHTML = topResults.map(result => `
                <div class="result-item">
                    <div class="result-course">${result.course}</div>
                    <div class="result-type">${result.type}</div>
                    <div class="result-marks">${result.marks}%</div>
                </div>
            `).join('');
        } else {
            recentResultsElement.innerHTML = '<p>No recent results available</p>';
        }
    }

    loadAlerts() {
        const alertsListElement = document.getElementById('alertsList');
        if (!alertsListElement) return;

        const alerts = [];
        const studentCourses = this.getStudentCourses();

        // Check attendance alerts
        studentCourses.forEach(course => {
            const attendancePercentage = this.getCourseAttendancePercentage(course.code);
            if (attendancePercentage < 75) {
                alerts.push({
                    type: 'warning',
                    message: `Low attendance in ${course.code}: ${attendancePercentage}%`
                });
            }
        });

        // Check grade alerts
        studentCourses.forEach(course => {
            const courseResults = this.resultsData[course.code]?.[this.currentUser.id];
            if (courseResults) {
                const currentGrade = this.calculateCurrentGrade(courseResults);
                if (currentGrade < 60) {
                    alerts.push({
                        type: 'warning',
                        message: `Low grade in ${course.code}: ${currentGrade}%`
                    });
                }
            }
        });

        if (alerts.length > 0) {
            alertsListElement.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <span class="alert-icon">⚠️</span>
                    <span class="alert-text">${alert.message}</span>
                </div>
            `).join('');
        } else {
            alertsListElement.innerHTML = '<p>No new alerts</p>';
        }
    }

    getCourseAttendancePercentage(courseCode) {
        const courseAttendance = this.attendanceData[courseCode]?.[this.currentUser.id] || [];
        if (courseAttendance.length === 0) return 100;

        const presentCount = courseAttendance.filter(record => record.status === 'present').length;
        return Math.round((presentCount / courseAttendance.length) * 100);
    }

    calculateCurrentGrade(courseResults) {
        let totalMarks = 0;
        let totalWeight = 0;

        // Quiz weight: 20%
        if (courseResults.quiz && courseResults.quiz.length > 0) {
            const avgQuiz = courseResults.quiz.reduce((a, b) => a + b, 0) / courseResults.quiz.length;
            totalMarks += avgQuiz * 0.2;
            totalWeight += 0.2;
        }

        // Assignment weight: 30%
        if (courseResults.assignment && courseResults.assignment.length > 0) {
            const avgAssignment = courseResults.assignment.reduce((a, b) => a + b, 0) / courseResults.assignment.length;
            totalMarks += avgAssignment * 0.3;
            totalWeight += 0.3;
        }

        // Midterm weight: 25%
        if (courseResults.midterm > 0) {
            totalMarks += courseResults.midterm * 0.25;
            totalWeight += 0.25;
        }

        // Final weight: 25% (not included in current grade if not taken)

        if (totalWeight === 0) return 0;
        return Math.round(totalMarks / totalWeight);
    }

    loadAttendanceData() {
        const attendanceListElement = document.getElementById('attendanceList');
        if (!attendanceListElement) return;

        const studentCourses = this.getStudentCourses();
        
        if (studentCourses.length === 0) {
            attendanceListElement.innerHTML = '<p>No courses enrolled</p>';
            return;
        }

        attendanceListElement.innerHTML = studentCourses.map(course => {
            const attendancePercentage = this.getCourseAttendancePercentage(course.code);
            const attendanceRecords = this.attendanceData[course.code]?.[this.currentUser.id] || [];
            const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
            const totalCount = attendanceRecords.length;

            return `
                <div class="attendance-course-item">
                    <div class="course-header">
                        <h4>${course.code} - ${course.name}</h4>
                        <div class="attendance-percentage ${attendancePercentage < 75 ? 'low' : 'good'}">
                            ${attendancePercentage}%
                        </div>
                    </div>
                    <div class="attendance-stats">
                        <span>Present: ${presentCount}</span>
                        <span>Total: ${totalCount}</span>
                        <span>Status: ${attendancePercentage >= 75 ? 'Good' : 'Needs Improvement'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadResultsData() {
        this.loadGradeSummary();
    }

    loadGradeSummary() {
        const gradeSummaryElement = document.getElementById('gradeSummary');
        if (!gradeSummaryElement) return;

        const studentCourses = this.getStudentCourses();
        
        if (studentCourses.length === 0) {
            gradeSummaryElement.innerHTML = '<p>No courses enrolled</p>';
            return;
        }

        gradeSummaryElement.innerHTML = studentCourses.map(course => {
            const courseResults = this.resultsData[course.code]?.[this.currentUser.id];
            const currentGrade = courseResults ? this.calculateCurrentGrade(courseResults) : 0;
            const letterGrade = studentPortal.calculateGrade(currentGrade);

            return `
                <div class="grade-course-item" onclick="showDetailedMarks('${course.code}')">
                    <div class="course-header">
                        <h4>${course.code}</h4>
                        <div class="grade-display">
                            <span class="grade-percentage">${currentGrade}%</span>
                            <span class="grade-letter ${this.getGradeClass(letterGrade)}">${letterGrade}</span>
                        </div>
                    </div>
                    <div class="course-name">${course.name}</div>
                </div>
            `;
        }).join('');
    }

    getGradeClass(grade) {
        switch (grade) {
            case 'A': return 'grade-a';
            case 'B': return 'grade-b';
            case 'C': return 'grade-c';
            case 'D': return 'grade-d';
            default: return 'grade-f';
        }
    }

    showDetailedMarks(courseCode) {
        const detailedMarksElement = document.getElementById('detailedMarks');
        if (!detailedMarksElement) return;

        const courseResults = this.resultsData[courseCode]?.[this.currentUser.id];
        if (!courseResults) {
            detailedMarksElement.innerHTML = '<p>No marks available for this course</p>';
            return;
        }

        const course = this.coursesData.find(c => c.code === courseCode);
        
        detailedMarksElement.innerHTML = `
            <div class="detailed-marks-header">
                <h3>${courseCode} - ${course.name}</h3>
            </div>
            <div class="marks-breakdown">
                ${this.renderMarksBreakdown(courseResults)}
            </div>
            <div class="grade-summary">
                <div class="current-grade">
                    Current Grade: ${this.calculateCurrentGrade(courseResults)}% 
                    (${studentPortal.calculateGrade(this.calculateCurrentGrade(courseResults))})
                </div>
            </div>
        `;
    }

    renderMarksBreakdown(courseResults) {
        let breakdown = '';

        // Quizzes
        if (courseResults.quiz && courseResults.quiz.length > 0) {
            breakdown += `
                <div class="assessment-type">
                    <h4>Quizzes (20% weight)</h4>
                    ${courseResults.quiz.map((mark, index) => `
                        <div class="assessment-item">
                            <span>Quiz ${index + 1}</span>
                            <span>${mark}%</span>
                        </div>
                    `).join('')}
                    <div class="assessment-average">
                        <span>Average</span>
                        <span>${Math.round(courseResults.quiz.reduce((a, b) => a + b, 0) / courseResults.quiz.length)}%</span>
                    </div>
                </div>
            `;
        }

        // Assignments
        if (courseResults.assignment && courseResults.assignment.length > 0) {
            breakdown += `
                <div class="assessment-type">
                    <h4>Assignments (30% weight)</h4>
                    ${courseResults.assignment.map((mark, index) => `
                        <div class="assessment-item">
                            <span>Assignment ${index + 1}</span>
                            <span>${mark}%</span>
                        </div>
                    `).join('')}
                    <div class="assessment-average">
                        <span>Average</span>
                        <span>${Math.round(courseResults.assignment.reduce((a, b) => a + b, 0) / courseResults.assignment.length)}%</span>
                    </div>
                </div>
            `;
        }

        // Midterm
        if (courseResults.midterm > 0) {
            breakdown += `
                <div class="assessment-type">
                    <h4>Midterm Exam (25% weight)</h4>
                    <div class="assessment-item">
                        <span>Midterm</span>
                        <span>${courseResults.midterm}%</span>
                    </div>
                </div>
            `;
        }

        // Final
        if (courseResults.final > 0) {
            breakdown += `
                <div class="assessment-type">
                    <h4>Final Exam (25% weight)</h4>
                    <div class="assessment-item">
                        <span>Final Exam</span>
                        <span>${courseResults.final}%</span>
                    </div>
                </div>
            `;
        }

        return breakdown;
    }
}

// Global function for showing detailed marks
function showDetailedMarks(courseCode) {
    if (window.studentDashboard) {
        window.studentDashboard.showDetailedMarks(courseCode);
    }
}

// Initialize student dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('student-dashboard.html')) {
        window.studentDashboard = new StudentDashboard();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentDashboard;
}