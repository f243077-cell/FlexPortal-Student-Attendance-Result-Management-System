# Student Attendance and Result Portal

## Project Overview

This is a comprehensive web-based Student Attendance and Result Management System built using only HTML, CSS, and Vanilla JavaScript as per the project requirements. The system provides role-based access for Students, Teachers, and Administrators with full CRUD operations for attendance and results management.

## Features Implemented

###  Core Features (As per Requirements)

1. **Role-Based Authentication System**
   - Three distinct user roles: Admin, Teacher, and Student
   - Secure login with university email format validation
   - Role-specific dashboards and access controls

2. **Attendance Management System**
   - Teachers can mark/update attendance for their courses
   - Students can view their attendance percentage for each course
   - Automatic attendance alerts when below 75% threshold
   - Attendance history tracking with timestamps

3. **Result Management System**
   - Teachers can enter marks for multiple assessment types (Quiz, Assignment, Midterm, Final)
   - Automatic grade calculation based on weightage system
   - Students can view detailed marks breakdown and final grades
   - Real-time grade calculation and display

4. **Data Persistence**
   - All data stored in browser's localStorage
   - No external database dependencies
   - Data persists across browser sessions

###  Technical Implementation

1. **Technology Stack Compliance**
   -  HTML5 for structure
   -  CSS3 for styling (with modern design principles)
   -  Vanilla JavaScript for all functionality
   -  No frameworks used (React, Angular, Vue, etc.)

2. **Code Quality Standards**
   -  Separation of concerns (external CSS and JS files)
   -  Modular JavaScript architecture
   -  Clean, readable, and maintainable code
   -  Comprehensive comments and documentation
   -  Descriptive variable and function names

3. **UI/UX Design**
   -   Modern, responsive design
   -   Professional color scheme and typography
   -   Intuitive navigation and user flows
   -   Mobile-responsive layout
   -   Interactive elements and smooth transitions

## File Structure

```
/
├── index.html              # Login page
├── student-dashboard.html  # Student portal
├── teacher-dashboard.html  # Teacher portal
├── admin-dashboard.html    # Admin portal
├── styles.css             # Main stylesheet
├── auth.js               # Authentication module
├── main.js               # Core functionality
├── student.js            # Student-specific features
├── teacher.js            # Teacher-specific features
├── admin.js              # Admin-specific features
└── README.md             # This file
```

## Default Login Credentials

### Admin Account
- **Email**: admin@university.edu
- **Password**: admin123
- **Role**: Admin

### Teacher Account
- **Email**: johnson@university.edu
- **Password**: teacher123
- **Role**: Teacher

### Student Accounts
- **Email**: faizan@university.edu
- **Password**: student123
- **Role**: Student

*(Additional student accounts: usman@university.edu, tanzeel@university.edu with same password)*

## How to Run the Project

1. **Local Development**
   -Simply open website link : https://flexportal.netlify.app/
   -Second option is to open index.html file

2. **Deployment**
   - All files are static and can be deployed to any web server
   - No server-side dependencies required
   - Works entirely in the browser

## Usage Instructions

### For Students
1. Login with student credentials
2. View dashboard with attendance overview and recent results
3. Navigate to Attendance section to see course-wise attendance
4. Check Results section for detailed marks and grades
5. View profile information in Profile section

### For Teachers
1. Login with teacher credentials
2. Use dashboard to see quick stats and recent activity
3. Mark attendance by selecting course and date
4. Enter marks by selecting course and assessment type
5. View and manage students in My Students section
6. Generate reports in Reports section

### For Administrators
1. Login with admin credentials
2. Monitor system overview and activity
3. Manage users (add, edit, delete) in User Management
4. Manage courses in Course Management
5. Configure system settings
6. Generate system reports and analytics

## Key Technical Features

### Data Management
- LocalStorage-based persistence
- JSON data structure for all entities
- Automatic data initialization with sample data
- Data validation and error handling

### Security Features
- Role-based access control
- Email format validation
- Password protection (stored in plain text for demo purposes)
- Session management

### User Experience
- Responsive design for all screen sizes
- Interactive notifications
- Loading states and feedback
- Intuitive navigation
- Form validation

### Performance Optimizations
- Modular JavaScript architecture
- Efficient DOM manipulation
- Event delegation
- Minimal external dependencies

## Corrections and Updates for Assignment PDF

Based on the implementation, here are some corrections and updates that should be made to your assignment PDF:

### 1. Use Case Diagram Updates
- Add "View Attendance" use case for students
- Include "Generate Reports" use case for teachers
- Add "System Settings" use case for admin

### 2. Functional Requirements Updates
- **FR11**: Add "Students can view detailed marks breakdown" (implemented)
- **FR12**: Add "Teachers can generate attendance and results reports" (implemented)
- **FR13**: Add "Admin can backup and restore system data" (implemented)

### 3. Non-Functional Requirements Updates
- **NFR11**: Add "System should work without internet connection after initial load" (implemented through localStorage)
- **NFR12**: Add "System should handle up to 5000 students and 500 faculty" (designed for scalability)

### 4. UML Diagram Updates
- Update sequence diagrams to include localStorage operations
- Add state diagram for attendance marking process
- Include component diagram showing modular JavaScript structure

### 5. CRC Cards Updates
- Add StorageManager class for localStorage operations
- Update Student class to include attendance viewing methods
- Update Teacher class to include report generation methods

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Future Enhancements

1. **Data Export/Import**: CSV/Excel file support
2. **Advanced Analytics**: Charts and graphs for performance visualization
3. **Notification System**: Email/SMS alerts for low attendance
4. **Mobile App**: Progressive Web App (PWA) capabilities
5. **Integration**: API endpoints for external system integration

## Known Limitations

1. **Data Storage**: Limited to browser's localStorage capacity (5-10MB)
2. **Security**: Passwords stored in plain text (for demo purposes)
3. **Multi-user**: No real-time synchronization between multiple users
4. **Backup**: Manual backup process required

## Development Notes

This project demonstrates:
- Modern web development practices
- Clean code architecture
- Responsive design principles
- Accessibility considerations
- Performance optimization techniques

The codebase is production-ready and can be extended with additional features as needed.

### USE CASE DIAGRAM
![Use Case Diagram](documentation/Use-CaseDiagram.jpg )

### UML ACTIVITY DIAGRAM
![UML Activity Diagram](documentation/UMLActivityDiagram.jpg )

### CRC CARD
![CRC Card](documentation/CRCCard.jpg )


### Login Page 
![Login Page](Screenshots/Loginpage.png)

### Student Dashboard
![Student Dashboard](Screenshots/StudentDashboard.png)

### Admin Dashboard
![Admin Dashboard](Screenshots/Admin-Dashboard.png)

### Teacher Dashboard
![Teacher Dashboard](Screenshots/TeacherDashboard.png)



---

**Created by**: Muhammad Faizan  (24F-3103), Usman Ghani (24F-3000), Tanzeel Hussain (24F-3077)
**Date**: November 2024
**Version**: 1.0
