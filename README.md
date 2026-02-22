# Smart Learning, Assessment, and Student Progress Tracking System

## Overview
A comprehensive full-stack application built with React (Frontend) and Node.js + Express + MongoDB (Backend). It supports three distinct roles (Student, Faculty, Admin) and manages courses, study materials, assignments, submissions, evaluations, and progress tracking.

## Features
- **Authentication & RBAC**: Secure JWT-based authentication with 'student', 'faculty', and 'admin' roles.
- **Course Management**: Faculty create/manage courses; students view enrolled courses.
- **Study Materials**: Faculty upload resources (PDFs, links) to courses.
- **Assignments & Submissions**: Faculty create assignments; students submit them; Faculty evaluate and provide marks.
- **Progress Tracking**: Automatic tracking of completion rates and average marks for students.
- **Admin Utilities**: Users management, system announcements, security overlays.

## Setup Instructions

### Backend (Node.js/Express)
1. Add a `.env` file in the `/server` directory (use `.env.example` as a template).
2. Start MongoDB locally or provide a MongoDB URI in `.env`.
3. Run `npm install` inside `/server`.
4. Run `npm run dev` to start the backend server (runs on port 3000 by default).
5. Swagger API Docs available at: `http://localhost:3000/api/documentation`

### Frontend (React/Vite)
1. Add a `.env` file in the `/client` directory with `VITE_API_BASE_URL=http://localhost:3000/api/v1`.
2. Run `npm install` inside `/client`.
   *(Note: if you encounter peer dependency issues with React 18 / Vue / Axios, use `npm install --legacy-peer-deps`)*
3. Run `npm run dev` to start the Vite dev server.

## Testing
- **Unit/Integration Testing**: Add `jest` and `supertest` to test API routes. Example configuration and tests can be structured in a `/tests` folder mirroring the `/src` folder. 
- Ensure MongoDB is running a test database when running integration tests.
