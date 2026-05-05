# TCWD Attendance Management System - Web App

A modern, cloud-based attendance management system for Toledo City Water District built with Next.js, Firebase, and Tailwind CSS.

## 🌟 Features

### For Attendees
- ✅ Sign up with Gmail
- ✅ View assigned meetings
- ✅ Real-time attendance history
- ✅ Seamless mobile integration

### For HR Managers
- ✅ Create and manage meetings
- ✅ Generate unique QR codes per meeting
- ✅ Real-time attendance tracking
- ✅ Export attendance reports to PDF
- ✅ Manage user roles and permissions

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Framework**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage)
- **PDF Export**: jsPDF + html2canvas
- **QR Codes**: qrcode.react
- **Hosting**: Firebase Hosting

## 📋 Prerequisites

- Node.js v20+
- npm v11+
- Firebase account

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore, Authentication (Gmail), and Cloud Storage
3. Copy your Firebase config

### 3. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📁 Project Structure

```
├── app/              # Next.js app directory
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # HR dashboard
│   ├── meetings/    # Attendee meetings
│   └── page.tsx    # Landing page
├── components/       # Reusable components
├── lib/             # Firebase & utilities
└── public/          # Static assets
```

## 🔐 Authentication

- Gmail sign-up/login via Firebase Auth
- Role-based access (HR Manager, Attendee)
- User profile storage in Firestore

## 📊 Database Schema

- `users`: User accounts
- `meetings`: Events requiring attendance
- `attendance`: Check-in records
- `qrcodes`: Generated QR codes
- `logs`: Audit trail

## 🚀 Build & Deploy

```bash
npm run build
firebase deploy
```

## 📝 Development

1. Branch: `git checkout -b feature/name`
2. Develop locally with `npm run dev`
3. Build: `npm run build`
4. Commit and push

## 📞 Support

See full documentation in `.gsd/` directory.
