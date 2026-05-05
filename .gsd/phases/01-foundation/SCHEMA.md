---
updated: 2026-05-05
version: 1.0
---

# Firestore Database Schema

## Overview

Document defines Firestore collection structure for TCWD Attendance System v1.0.

All timestamps use ISO 8601 format (`2026-05-05T14:30:00Z`).

---

## Collections

### `users/`

User accounts (both HR and Attendees).

**Schema:**

```
{
  uid: string (Firebase Auth UID - document ID)
  email: string (Gmail email)
  name: string (Display name)
  role: enum ["attendee", "hr"] (User role)
  department: string (optional, for attendees)
  position: string (optional, for attendees)
  photoURL: string (optional, from Gmail)
  createdAt: timestamp (Account creation)
  updatedAt: timestamp (Last updated)
  lastLoginAt: timestamp (Last login time)
  isActive: boolean (Account status)
}
```

**Indexes:**
- `email` (unique constraint - application level)
- `role` (query HR users)
- `createdAt` (sort by newest)

**Security Rules:**
- Users can read their own document
- HR can read all attendee documents
- Only Firebase Auth can write on signup

---

### `meetings/`

Meetings/events that require attendance tracking.

**Schema:**

```
{
  id: string (document ID - auto-generated)
  title: string (Meeting name)
  description: string (optional)
  date: date (Meeting date: 2026-05-15)
  startTime: string (Time: "09:00" in 24h format)
  endTime: string (Time: "10:30" in 24h format)
  venue: string (Location)
  createdBy: string (HR user uid)
  status: enum ["draft", "active", "completed", "cancelled"] (Meeting status)
  attendeeIds: array[string] (Assigned attendee uids)
  qrcodeId: string (Reference to generated QR code)
  notes: string (optional, internal notes)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Indexes:**
- `createdBy` + `status` (HR person's active meetings)
- `date` (upcoming meetings)
- `status` (filter by status)

**Security Rules:**
- Only HR can create/edit meetings
- Creator can manage their meetings
- Attendees can read meetings assigned to them
- Read-only for attendees

---

### `attendance/`

Attendance records (check-in/check-out events).

**Schema:**

```
{
  id: string (document ID - auto-generated)
  meetingId: string (Reference to meeting)
  userId: string (Reference to user)
  checkInTime: timestamp (When they checked in)
  checkOutTime: timestamp (optional, when they checked out)
  signature: string (optional, base64 image or initials)
  notes: string (optional, attendee notes)
  deviceInfo: {
    platform: string ("web" or "android")
    userAgent: string (optional)
    timestamp: timestamp
  }
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Composite Key:** `meetingId` + `userId` must be unique (no duplicate check-ins).

**Indexes:**
- `meetingId` (get all attendance for a meeting)
- `userId` (get all attendance for a user)
- `checkInTime` (sort by time)
- Composite: `meetingId` + `checkInTime` (recent attendees first)

**Security Rules:**
- Authenticated users can create (one record only)
- HR can read all for their meetings
- Users can read their own records

---

### `qrcodes/`

Generated QR codes for meetings.

**Schema:**

```
{
  id: string (document ID - auto-generated)
  meetingId: string (Reference to meeting)
  code: string (Unique QR code payload)
  type: enum ["meeting", "daily"] (QR code type)
  data: {
    meetingId: string
    generatedAt: timestamp
    expiresAt: timestamp (optional, for one-time codes)
    scanLimit: number (optional, max scans)
  }
  qrcodeUrl: string (optional, URL to QR code image)
  createdBy: string (HR user uid)
  createdAt: timestamp
  expiresAt: timestamp (When code becomes invalid)
  isActive: boolean (Whether code is scannable)
}
```

**Indexes:**
- `meetingId` (get QR codes for a meeting)
- `code` (unique lookup)
- `expiresAt` (cleanup expired codes)

**Security Rules:**
- Public read access to QR code metadata (validate on client)
- Only HR can create QR codes
- HR can deactivate QR codes

---

### `logs/` (Audit Trail)

System audit trail for compliance.

**Schema:**

```
{
  id: string (document ID - auto-generated)
  action: enum ["user_login", "meeting_created", "qrcode_scanned", "attendance_recorded"] (Action type)
  userId: string (Who did the action)
  resourceId: string (Document ID affected)
  resourceType: enum ["user", "meeting", "attendance", "qrcode"] (Type of resource)
  changes: object (What changed)
  ipAddress: string (optional)
  userAgent: string (optional)
  status: enum ["success", "failed"] (Whether action succeeded)
  createdAt: timestamp
}
```

**Indexes:**
- `userId` + `createdAt` (user activity log)
- `action` (filter by action type)
- `createdAt` (timeline view)

**Security Rules:**
- Only HR can read
- No direct user writes (only via Cloud Functions)

---

## Data Relationships

```
users
  ├─ meetings (1-N: one HR creates many meetings)
  ├─ qrcodes (1-N: one HR generates many QR codes)
  └─ attendance (1-N: one user has many attendance records)
      └─ meetings (N-1: many attendances link to one meeting)
          ├─ qrcodes (1-1: meeting has one active QR code)
          └─ users (N-N: meeting has many attendees)

attendance
  ├─ meetingId → meetings
  ├─ userId → users
  └─ logs (1-N: attendance creates log entry)
```

---

## Sample Data

### Sample User (HR)

```json
{
  "uid": "hr_001",
  "email": "hr@tcwd.gov.ph",
  "name": "Maria Santos",
  "role": "hr",
  "photoURL": "https://...",
  "createdAt": "2026-05-01T08:00:00Z",
  "updatedAt": "2026-05-05T14:30:00Z",
  "lastLoginAt": "2026-05-05T14:30:00Z",
  "isActive": true
}
```

### Sample User (Attendee)

```json
{
  "uid": "att_001",
  "email": "john.cruz@tcwd.gov.ph",
  "name": "John Cruz",
  "role": "attendee",
  "department": "Water Quality",
  "position": "Technician",
  "photoURL": "https://...",
  "createdAt": "2026-05-02T09:15:00Z",
  "updatedAt": "2026-05-05T10:45:00Z",
  "lastLoginAt": "2026-05-05T10:45:00Z",
  "isActive": true
}
```

### Sample Meeting

```json
{
  "id": "meet_001",
  "title": "Q2 Safety Briefing",
  "description": "Quarterly water quality safety update",
  "date": "2026-05-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "venue": "Main Conference Room",
  "createdBy": "hr_001",
  "status": "active",
  "attendeeIds": ["att_001", "att_002", "att_003"],
  "qrcodeId": "qr_001",
  "notes": "Bring updated certifications",
  "createdAt": "2026-05-05T08:00:00Z",
  "updatedAt": "2026-05-05T14:30:00Z"
}
```

### Sample QR Code

```json
{
  "id": "qr_001",
  "meetingId": "meet_001",
  "code": "meet_001_20260515_0900_abc123def456",
  "type": "meeting",
  "data": {
    "meetingId": "meet_001",
    "generatedAt": "2026-05-05T08:00:00Z",
    "expiresAt": "2026-05-15T11:00:00Z"
  },
  "qrcodeUrl": "https://firebasestorage.googleapis.com/...",
  "createdBy": "hr_001",
  "createdAt": "2026-05-05T08:00:00Z",
  "expiresAt": "2026-05-15T11:00:00Z",
  "isActive": true
}
```

### Sample Attendance

```json
{
  "id": "att_rec_001",
  "meetingId": "meet_001",
  "userId": "att_001",
  "checkInTime": "2026-05-15T09:05:30Z",
  "checkOutTime": null,
  "signature": "base64_encoded_image_or_signature",
  "notes": "Arrived early",
  "deviceInfo": {
    "platform": "android",
    "userAgent": "Mozilla/5.0 (Linux; Android 12)",
    "timestamp": "2026-05-15T09:05:30Z"
  },
  "createdAt": "2026-05-15T09:05:30Z",
  "updatedAt": "2026-05-15T09:05:30Z"
}
```

---

## Firestore Rules (Draft)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{uid} {
      allow read: if request.auth.uid == uid || 
                     (request.auth.token.role == 'hr' && resource.data.role == 'attendee');
      allow write: if request.auth.uid == uid;
    }
    
    // Meetings collection
    match /meetings/{meetingId} {
      allow read: if request.auth.token.role == 'hr' ||
                     request.auth.uid in resource.data.attendeeIds;
      allow create, update: if request.auth.token.role == 'hr' &&
                              request.auth.uid == request.resource.data.createdBy;
      allow delete: if request.auth.token.role == 'hr' &&
                      request.auth.uid == resource.data.createdBy;
    }
    
    // Attendance records
    match /attendance/{attendanceId} {
      allow read: if request.auth.token.role == 'hr';
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId &&
                      resource.data.checkInTime != null;
    }
    
    // QR Codes
    match /qrcodes/{qrcodeId} {
      allow read: if true; // Public read for validation
      allow write: if request.auth.token.role == 'hr';
    }
    
    // Audit logs (HR only)
    match /logs/{logId} {
      allow read: if request.auth.token.role == 'hr';
      allow write: if false; // Only via Cloud Functions
    }
  }
}
```

---

## Migration Notes

If adding new collections later:

1. Update this schema document
2. Add migration scripts to `.gsd/migrations/`
3. Test in development first
4. Document backward compatibility concerns
5. Commit migration with explanation

