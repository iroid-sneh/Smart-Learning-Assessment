# Smart Learning, Assessment & Student Progress Tracking System - Project Plan

> **Audit Date:** 2026-03-21
> **Status Legend:** [x] = Implemented & Working | [ ] = Missing / Not Implemented | [!] = Has Issues (see notes)

---

## Phase 1: Authentication & Security (Backend + Frontend)

### 1.1 Registration
- [x] POST `/api/v1/auth/register` - User registration endpoint
- [x] Email format validation
- [x] Unique email constraint (duplicate check + MongoDB unique index)
- [x] Password strength check (min 6 characters)
- [x] Password hashing (Argon2)
- [x] OTP generation (4-digit) on registration
- [x] OTP email sent via Nodemailer (EJS template: `verify-otp.ejs`)
- [x] OTP expiry set to 5 minutes
- [x] Role selection (student/faculty)
- [x] Cleanup on failed registration (deletes created user if email fails)
- [x] Re-sends OTP if user exists but email not verified
- [x] Frontend: RegisterPage with name, email, password, role selector
- [x] Frontend: Redirects to OTP verification page after registration

### 1.2 OTP Verification
- [x] POST `/api/v1/auth/verify-otp` - Verify OTP endpoint
- [x] Validates OTP match
- [x] Checks OTP expiry
- [x] Sets `isEmailVerified = true` on success
- [x] Clears OTP fields after verification
- [x] Auto-generates JWT token on verification (auto-login)
- [x] Frontend: VerifyOtpPage with email + OTP input

### 1.3 Login
- [x] POST `/api/v1/auth/login` - Login endpoint
- [x] Email + password validation
- [x] Role-based login (student/faculty via User model, admin via Admin model)
- [x] Checks `isActive` status (deactivated accounts blocked)
- [x] Checks `isEmailVerified` (unverified accounts blocked)
- [x] Password verification (Argon2)
- [x] JWT token generation with user info (email, name, role)
- [x] Frontend: LoginPage with role selector, email, password
- [x] Frontend: JWT stored in localStorage
- [x] Frontend: Auto-redirect to role-based dashboard on login

### 1.4 Forgot Password / Reset Password
- [x] POST `/api/v1/auth/forgot-password` - Send OTP for password reset
- [x] POST `/api/v1/auth/reset-password` - Reset password with OTP + new password
- [x] Password reset email template (`password-reset.ejs`)
- [x] Frontend: ForgotPasswordPage - Email input, sends OTP
- [x] Frontend: ResetPasswordPage - OTP + new password input
- [x] Login page "Forgot your password?" link wired to `/forgot-password`
- [x] Joi validation DTOs (forgotPasswordDto, resetPasswordDto)
- [x] OTP expiry (5 minutes), secure email response (doesn't reveal if email exists)

### 1.5 JWT Authentication Middleware
- [x] Bearer token extraction from Authorization header
- [x] Token verification and decoding
- [x] Token expiration check (7-day expiry)
- [x] User lookup and `isActive` check
- [x] Dual-model support (User + Admin)
- [x] `req.user` populated for downstream handlers

### 1.6 Role-Based Authorization
- [x] Middleware: `authorize(...roles)` - restricts routes by role
- [x] Student, Faculty, Admin roles enforced
- [x] Frontend: ProtectedRoute component with `allowedRoles` prop
- [x] Frontend: Role-based sidebar navigation menus
- [x] Frontend: Unauthorized users redirected to login

### 1.7 Security Middleware
- [x] Helmet security headers
- [x] CORS enabled (all origins in dev)
- [x] Rate limiting (configurable via env: default 5000 req/15min)
- [x] Express JSON & URL-encoded body parsing
- [ ] Input sanitization (mongo-sanitize / XSS) - **NOT IMPLEMENTED** (low priority, validations cover most cases)

---

## Phase 2: Course Management (Backend + Frontend)

### 2.1 Course CRUD - Backend
- [x] POST `/api/v1/courses` - Create course (faculty/admin)
- [x] GET `/api/v1/courses` - Get all courses (authenticated users)
- [x] GET `/api/v1/courses/:id` - Get single course
- [x] PUT `/api/v1/courses/:id` - Update course (owner/admin)
- [x] DELETE `/api/v1/courses/:id` - Delete course (owner/admin)
- [x] Unique course code validation
- [x] Required fields: title, code
- [x] Prevent empty updates
- [x] ObjectId validation middleware

### 2.2 Student Enrollment
- [x] POST `/api/v1/courses/:id/add-student` - Enroll student
- [x] Prevents duplicate enrollment
- [x] Email notification on enrollment (`course-enrollment.ejs` template)
- [x] Safety guard: new registrations don't auto-enroll

### 2.3 Course Management - Frontend
- [x] Faculty: CourseManagementPage - Create, edit, delete courses
- [x] Faculty: Enroll students into courses
- [x] Faculty: View enrolled students
- [x] Admin: AdminCourseManagementPage - Create, assign faculty, delete
- [x] Student: CoursesPage - View all available courses
- [x] Student: CourseDetailsPage - View course details, materials, assignments

---

## Phase 3: Study Material Management (Backend + Frontend)

### 3.1 Materials CRUD - Backend
- [x] POST `/api/v1/materials` - Upload material (faculty)
- [x] GET `/api/v1/courses/:id/materials` - Get course materials
- [x] PUT `/api/v1/materials/:id` - Update material
- [x] DELETE `/api/v1/materials/:id` - Delete material
- [x] Title required validation
- [x] File upload via Multer (disk storage)
- [x] Course existence validation

### 3.2 Materials - Frontend
- [x] Faculty: StudyMaterialsPage - Upload, view, delete materials
- [x] Student: Access materials from CourseDetailsPage

---

## Phase 4: Assignment Management (Backend + Frontend)

### 4.1 Assignment CRUD - Backend
- [x] POST `/api/v1/assignments` - Create assignment (faculty)
- [x] GET `/api/v1/courses/:id/assignments` - Get course assignments
- [x] PUT `/api/v1/assignments/:id` - Update assignment
- [x] DELETE `/api/v1/assignments/:id` - Delete assignment
- [x] Due date must be future validation (on create)
- [x] Title required validation
- [x] No empty updates validation
- [x] Email notification to enrolled students on creation (`assigment.ejs` template)

### 4.2 Assignments - Frontend
- [x] Faculty: AssignmentManagementPage - Create, edit, delete assignments
- [x] Student: AssignmentsPage - View assignments with 3D card UI
- [x] Student: Color-coded by status (Pending/Submitted/Evaluated)
- [x] Student: Due date tracking display

---

## Phase 5: Assignment Submission (Backend + Frontend)

### 5.1 Submissions - Backend
- [x] POST `/api/v1/submissions/assignment/:id` - Submit assignment (student)
- [x] GET `/api/v1/assignments/:id/submissions` - Get submissions (faculty/admin)
- [x] GET `/api/v1/submissions/my` - Get student's own submissions
- [x] Prevent duplicate submission (one per student per assignment)
- [x] Student must be enrolled in course
- [x] File upload required (Multer)
- [x] Only students can submit

### 5.2 Submissions - Frontend
- [x] Student: File upload for submission on AssignmentsPage
- [x] Student: View submission status
- [x] Faculty: View all submissions on EvaluationPage

---

## Phase 6: Evaluation & Marks (Backend + Frontend)

### 6.1 Evaluation - Backend
- [x] PUT `/api/v1/submissions/:id/evaluate` - Evaluate submission (faculty/admin)
- [x] Marks validation (cannot exceed totalMarks)
- [x] Feedback field support
- [x] Status update: submitted -> evaluated
- [x] Email notification to student on evaluation (`evaluation.ejs` template)
- [x] Faculty ownership check (must own the course)

### 6.2 Evaluation - Frontend
- [x] Faculty: EvaluationPage - Select assignment, view submissions
- [x] Faculty: Input marks and feedback
- [x] Faculty: Download submission files
- [x] Student: View marks and feedback on AssignmentsPage

---

## Phase 7: Student Progress Tracking (Backend + Frontend)

### 7.1 Progress - Backend
- [x] GET `/api/v1/students/:id/progress` - Get student progress
- [x] Dynamic progress calculation
- [x] Completion % = (submitted / total assignments) x 100
- [x] Average Marks = total marks / evaluated assignments
- [x] Division by zero protection (returns 0 when no assignments/evaluations)
- [x] Students can only view their own progress
- [x] Faculty/Admin can view any student's progress

### 7.2 Progress - Frontend
- [x] Student: ProgressPage - Overall stats, course-wise breakdown
- [x] Student: Submission history table
- [x] Student: Dashboard shows progress snapshot
- [x] Admin: ProgressMonitoringPage - Monitor any student's progress

---

## Phase 8: Announcements (Backend + Frontend)

### 8.1 Announcements - Backend
- [x] POST `/api/v1/announcements` - Create announcement (admin only)
- [x] GET `/api/v1/announcements` - Get all announcements (all authenticated)
- [x] PUT `/api/v1/announcements/:id` - Update announcement (admin)
- [x] DELETE `/api/v1/announcements/:id` - Delete announcement (admin)
- [x] Types: Academic, Event, System, General
- [x] Title and message required validation

### 8.2 Announcements - Frontend
- [x] Admin: AnnouncementsPage - Create, edit, delete announcements
- [x] All users: View announcements in notification panel (Layout component)
- [x] Dashboard: Announcements sidebar on dashboards

---

## Phase 9: Email Notification System

- [x] Nodemailer integration (Gmail SMTP)
- [x] EJS-based email templates with styled HTML
- [x] Registration OTP email (`verify-otp.ejs`)
- [x] Course enrollment email (`course-enrollment.ejs`)
- [x] Assignment created email (`assigment.ejs`)
- [x] Assignment evaluated email (`evaluation.ejs`)
- [x] Password reset email (`password-reset.ejs`)
- [x] OTP expiration handling (5 minutes)
- [x] Bulk email support (array of recipients for assignment notifications)

---

## Phase 10: Admin Module (Backend + Frontend)

### 10.1 Admin Auth
- [x] Separate Admin model with its own credentials
- [x] Admin login via role selector on LoginPage
- [x] Admin seeder for initial admin account

### 10.2 User Management - Backend
- [x] GET `/api/v1/users` - Get all users (admin) / Get students (faculty)
- [x] PUT `/api/v1/users/:id` - Update user role/status (admin)
- [x] DELETE `/api/v1/users/:id` - Delete user (admin)
- [x] Prevents admin self-deletion
- [x] Role validation (student/faculty/admin)

### 10.3 User Management - Frontend
- [x] Admin: UserManagementPage - View, filter, update, deactivate, delete users
- [x] Admin: AdminDashboard - System overview stats, quick actions

---

## Phase 11: Validation & Error Handling

### 11.1 Validation System
- [x] Joi-based DTO validation (register, login, verify-otp, courses, materials, assignments, submissions, announcements)
- [x] Null/undefined checks
- [x] Empty string checks
- [x] ObjectId validation middleware (`validateObjectId`)
- [x] Numeric validation (marks 0-100)
- [x] No empty updates enforcement

### 11.2 Centralized Error Handling
- [x] Custom Exception hierarchy (BadRequest, NotFound, Unauthorized, Forbidden, Conflict, etc.)
- [x] HTTP status codes mapping (400, 401, 403, 404, 409, 422, 500)
- [x] Joi validation error formatting
- [x] No stack trace in production
- [x] No server crashes (all errors caught)

---

## Phase 12: Frontend Architecture

### 12.1 Core Setup
- [x] React 18 + TypeScript + Vite
- [x] Tailwind CSS styling
- [x] React Router v6 navigation
- [x] Axios API integration with base URL config
- [x] Auth context with localStorage persistence
- [x] Auto-logout on 401 responses
- [x] Protected routes with role checks

### 12.2 UI Components
- [x] Layout with responsive sidebar
- [x] Reusable UI: Button, Card, Input, Modal, Badge, ProgressBar, Table, Tabs, FileUpload
- [x] StatCard component for dashboard metrics
- [x] Loading & error states
- [x] Framer Motion animations
- [x] Mobile-responsive design

### 12.3 Landing Page
- [x] Hero section with feature showcase
- [x] Benefits list and statistics
- [x] Sign in / Get started navigation

---

## Summary

| Module                    | Status           |
|---------------------------|------------------|
| Registration & OTP        | COMPLETE         |
| Login                     | COMPLETE         |
| Forgot/Reset Password     | COMPLETE         |
| JWT Auth & Middleware      | COMPLETE         |
| Role-Based Access          | COMPLETE         |
| Security (Helmet/CORS/Rate)| COMPLETE        |
| Course Management         | COMPLETE         |
| Study Materials            | COMPLETE         |
| Assignments                | COMPLETE         |
| Submissions                | COMPLETE         |
| Evaluation & Marks         | COMPLETE         |
| Progress Tracking          | COMPLETE         |
| Announcements              | COMPLETE         |
| Email Notifications        | COMPLETE         |
| Admin Module               | COMPLETE         |
| Validation & Error Handling| COMPLETE         |
| Frontend (All Pages)       | COMPLETE         |
| Input Sanitization         | NOT IMPLEMENTED  |
