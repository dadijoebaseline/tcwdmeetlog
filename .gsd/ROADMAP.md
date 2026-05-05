---
status: draft
timeline: "6 weeks"
updated: 2026-05-05
---

# TCWD Attendance - Project Roadmap

## Overview

6-phase development cycle for complete attendance management system (web + Android).

## Phase Overview

| # | Phase | Goal | Duration | Dependencies |
|---|-------|------|----------|--------------|
| 1 | **Foundation** | Firebase setup, Next.js scaffold, Tailwind base | 1 week | None |
| 2 | **Authentication** | Gmail auth for attendees & HR, role-based access | 1 week | Phase 1 |
| 3 | **HR Dashboard** | Meeting management, QR code generation | 1.5 weeks | Phase 2 |
| 4 | **Attendance Tracking** | QR code scanning, real-time recording, Android bridge | 1.5 weeks | Phase 3 |
| 5 | **Export & Reporting** | PDF export, attendance reports, analytics | 1 week | Phase 4 |
| 6 | **Mobile Integration** | Android app build, QR scanner, sync | 1.5 weeks | Phase 4 |

**Total**: 8 weeks (with 2 weeks buffer for testing/fixes)

---

## Phase 1: Foundation (Week 1)

**Goal:** Get web app running locally with Firebase + Tailwind + basic navigation

### Why This Phase
- Establish development environment
- Prove Firebase Spark Plan works for project
- Build UI foundation that other phases depend on
- Set up CI/CD pipeline

### What Gets Built
- Next.js 15 project initialized
- Firebase Firestore + Auth configured
- Tailwind CSS integrated
- Basic page layout (home, login redirects)
- Authentication provider setup
- Database schema for core entities
- Deployment preview to Firebase Hosting

### Deliverables
- [ ] Development environment working
- [ ] Firebase console configured
- [ ] Local dev server running
- [ ] Basic pages: Landing, Login, Dashboard stub
- [ ] Tailwind working end-to-end
- [ ] .env.local configured
- [ ] README with setup instructions

### Success Criteria
- `npm run dev` launches without errors
- Firebase connects successfully in console
- Tailwind classes render correctly
- Database schema defined in Firestore

---

## Phase 2: Authentication (Week 2)

**Goal:** Users can sign up/login with Gmail, system knows who they are, supports HR + Attendee roles

### Why This Phase
- All other features require knowing user identity
- Gmail auth lowers barrier to entry
- Role-based access (HR vs Attendee) gates features
- Foundation for secure data access

### What Gets Built
- Firebase Authentication with Gmail provider
- Sign-up/login pages
- User roles: HR, Attendee
- Role-based redirects (HR → Dashboard, Attendee → Meetings)
- User profile storage in Firestore
- Logout functionality
- Protected routes with middleware
- Auth state management (Context/Zustand)

### Deliverables
- [ ] Gmail login/signup flow working
- [ ] User roles assigned and stored
- [ ] Protected routes enforced
- [ ] Role-based navigation
- [ ] Profile page
- [ ] Logout works

### Success Criteria
- Sign up with Gmail → redirected to role selection
- Select HR role → see HR dashboard
- Select Attendee role → see meetings list
- Logout → redirect to login
- Refresh page → stays authenticated

---

## Phase 3: HR Dashboard (Week 3-4)

**Goal:** HR can create meetings, manage attendees, generate QR codes, see attendance in real-time

### Why This Phase
- Core business value: HR controls entire system
- Meetings are the root entity everything depends on
- QR codes are generated here for attendees to scan

### What Gets Built
- Meeting CRUD (Create, Read, Update, Delete)
- Attendee list management per meeting
- QR code generation (use qrcode.react)
- Real-time attendance tracking UI
- Meeting history/archive
- Dashboard with KPIs (total meetings, today's attendees, etc.)
- Firestore rules for data isolation

### Deliverables
- [ ] HR can create a meeting with title, date, time, venue
- [ ] HR can add attendees to meeting (manually or CSV upload)
- [ ] QR code displays and can be downloaded/printed
- [ ] Real-time table shows check-ins as they happen
- [ ] View past meetings and attendance records
- [ ] Dashboard KPIs

### Success Criteria
- Create meeting with 5 fields
- Generate unique QR code per meeting
- See attendance table update in real-time
- Export meeting attendee list

---

## Phase 4: Attendance Tracking (Week 4-5)

**Goal:** System accurately records when attendees mark attendance, integrates with Android app

### Why This Phase
- Core transaction: "Employee attends meeting"
- QR code validation ensures authorization
- Real-time sync = HR sees check-ins instantly
- Android integration point

### What Gets Built
- QR code format/payload design
- Attendance recording API (Cloud Functions)
- Attendance form (name, signature, timestamp)
- Real-time Firestore listeners
- Duplicate check (can't check in twice)
- Time-based validation (check-in only during meeting window)
- Attendance history per attendee
- API endpoints for Android app
- Validation rules (security)

### Deliverables
- [ ] Web form to mark attendance with QR validation
- [ ] API endpoint: POST /api/attendance/checkin
- [ ] Real-time updates in HR dashboard
- [ ] Attendance records in Firestore
- [ ] Validation: only valid QR codes accepted
- [ ] Android bridge API ready

### Success Criteria
- Scan QR code → form appears with meeting details
- Fill form → attendance recorded in Firestore
- HR dashboard updates in real-time
- Can't submit without all required fields
- Can't submit outside meeting time window
- Android app can call API and get response

---

## Phase 5: Export & Reporting (Week 5-6)

**Goal:** Generate PDF reports, view analytics, download attendance data

### Why This Phase
- Business requirement: formal documentation of attendance
- Compliance: auditable records
- HR needs to share reports

### What Gets Built
- PDF generation (jsPDF or react-pdf)
- Meeting report template (attendees + attendance)
- Attendance export to CSV
- Analytics dashboard (attendance rates, trends)
- Historical reports
- Signature capture in PDF

### Deliverables
- [ ] Generate PDF for meeting with attendees and attendance
- [ ] CSV export of attendance data
- [ ] Attendance analytics dashboard
- [ ] Email PDF (optional, if not Spark Plan limited)

### Success Criteria
- Click "Export PDF" → download professional report
- CSV includes all relevant fields
- Analytics show attendance rates per person

---

## Phase 6: Mobile Integration (Week 6-7.5)

**Goal:** Android app can scan QR codes, record attendance, sync with web app in real-time

### Why This Phase
- Attendees use Android app, not web
- QR scanning is core UX pattern
- Offline-first: should work even if internet temporarily down

### What Gets Built
- Android app (React Native or native)
- QR code scanner (Camera + ML Kit)
- Attendance form
- Local storage / offline sync
- API client for web backend
- Firebase SDK integration (Firestore, Auth)
- Push notifications (optional)

### Deliverables
- [ ] Android app APK
- [ ] QR scanner functional
- [ ] Offline storage with sync
- [ ] API integration
- [ ] Firebase sign-in via Gmail

### Success Criteria
- Open Android app → sees meetings assigned to user
- Tap meeting → camera opens for QR scanning
- Scan valid QR → form appears
- Fill form → attendance synced to Firestore
- HR sees check-in in real-time
- If offline, records locally and syncs when online

---

## Timeline Gantt

```
Week 1:   [Phase 1: Foundation ==================]
Week 2:                 [Phase 2: Auth ==================]
Week 3-4:                         [Phase 3: HR Dashboard ========================]
Week 4-5:                                    [Phase 4: Attendance ========================]
Week 5-6:                                                [Phase 5: Export ==================]
Week 6-7.5:                                              [Phase 6: Mobile ===========================]
```

---

## Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Authentication)
    ↓
Phase 3 (HR Dashboard)
    ↓
Phase 4 (Attendance Tracking) ←---→ Phase 6 (Mobile, in parallel after Phase 4 starts)
    ↓
Phase 5 (Export & Reporting)
    ↓
v1.0 Release
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Firebase Spark Plan limits exceeded | Monitor usage, implement caching, batch operations |
| QR code conflicts/collisions | Use timestamp + meeting ID, verify uniqueness |
| Offline sync complexity | Use Firebase local persistence or Realm DB |
| Android build complexity | Use React Native for faster iteration |
| Real-time performance issues | Optimize Firestore queries, use pagination |

---

## Success Metrics (v1.0 Launch)

- ✅ System handles 50+ concurrent users
- ✅ QR code scanning works 99.9% of the time
- ✅ Attendance records < 100ms to appear in dashboard
- ✅ PDF export generates in < 5 seconds
- ✅ Zero data loss on offline sync
- ✅ 5+ HR users actively managing meetings
