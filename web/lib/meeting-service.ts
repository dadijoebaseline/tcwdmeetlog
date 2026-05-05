import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Query,
  QueryConstraint,
  addDoc,
  Timestamp,
  FieldValue,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  venue: string;
  description?: string;
  createdBy: string; // User UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attendees: MeetingAttendee[];
  qrCode?: string; // QR code data URL
  status: 'active' | 'archived'; // active or archived
}

export interface MeetingAttendee {
  uid: string;
  name: string;
  email: string;
  checkedIn: boolean;
  checkInTime?: Timestamp;
}

/**
 * Create a new meeting
 */
export async function createMeeting(meetingData: {
  title: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
  createdBy: string;
}): Promise<string> {
  const now = Timestamp.now();
  const meetingRef = await addDoc(collection(db, 'meetings'), {
    ...meetingData,
    attendees: [],
    qrCode: null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
  return meetingRef.id;
}

/**
 * Get a single meeting by ID
 */
export async function getMeeting(meetingId: string): Promise<Meeting | null> {
  const docRef = doc(db, 'meetings', meetingId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Meeting;
}

/**
 * Get all meetings (with optional constraints)
 */
export async function getAllMeetings(
  constraints: QueryConstraint[] = []
): Promise<Meeting[]> {
  const defaultConstraints = [orderBy('createdAt', 'desc')];
  const allConstraints = [...defaultConstraints, ...constraints];

  const q = query(collection(db, 'meetings'), ...allConstraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Meeting[];
}

/**
 * Get meetings by status (active or archived)
 */
export async function getMeetingsByStatus(
  status: 'active' | 'archived'
): Promise<Meeting[]> {
  const q = query(
    collection(db, 'meetings'),
    where('status', '==', status)
  );
  const querySnapshot = await getDocs(q);

  const meetings = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Meeting[];

  return meetings.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

/**
 * Get meetings by created user
 */
export async function getMeetingsByCreator(userId: string): Promise<Meeting[]> {
  const q = query(
    collection(db, 'meetings'),
    where('createdBy', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  const meetings = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Meeting[];

  // Sort client-side to avoid requiring a composite Firestore index
  return meetings.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

/**
 * Get all meetings where a user is listed as an attendee (client-side filter)
 */
export async function getMeetingsByAttendee(userId: string): Promise<Meeting[]> {
  const q = query(
    collection(db, 'meetings'),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);

  const meetings = querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Meeting))
    .filter((m) => m.attendees?.some((att) => att.uid === userId));

  return meetings.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

/**
 * Search meetings by title (client-side)
 */
export function searchMeetings(
  meetings: Meeting[],
  searchTerm: string
): Meeting[] {
  if (!searchTerm.trim()) return meetings;

  const term = searchTerm.toLowerCase();
  return meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(term) ||
      meeting.venue.toLowerCase().includes(term)
  );
}

/**
 * Filter meetings by date range
 */
export function filterMeetingsByDateRange(
  meetings: Meeting[],
  startDate: string,
  endDate: string
): Meeting[] {
  return meetings.filter((meeting) => {
    return meeting.date >= startDate && meeting.date <= endDate;
  });
}

/**
 * Update meeting details
 */
export async function updateMeeting(
  meetingId: string,
  updates: Partial<Meeting>
): Promise<void> {
  const meetingRef = doc(db, 'meetings', meetingId);
  await updateDoc(meetingRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update QR code for meeting
 */
export async function updateMeetingQRCode(
  meetingId: string,
  qrCodeData: string
): Promise<void> {
  const meetingRef = doc(db, 'meetings', meetingId);
  await updateDoc(meetingRef, {
    qrCode: qrCodeData,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Archive a meeting
 */
export async function archiveMeeting(meetingId: string): Promise<void> {
  await updateMeeting(meetingId, { status: 'archived' });
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(meetingId: string): Promise<void> {
  const meetingRef = doc(db, 'meetings', meetingId);
  await deleteDoc(meetingRef);
}

/**
 * Add attendee to meeting
 */
export async function addMeetingAttendee(
  meetingId: string,
  attendee: MeetingAttendee
): Promise<void> {
  const meetingRef = doc(db, 'meetings', meetingId);
  await updateDoc(meetingRef, {
    attendees: arrayUnion(attendee),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Remove attendee from meeting
 */
export async function removeMeetingAttendee(
  meetingId: string,
  attendeeUid: string
): Promise<void> {
  const meeting = await getMeeting(meetingId);
  if (!meeting) return;

  const attendeeToRemove = meeting.attendees.find(
    (att) => att.uid === attendeeUid
  );
  if (attendeeToRemove) {
    const meetingRef = doc(db, 'meetings', meetingId);
    await updateDoc(meetingRef, {
      attendees: arrayRemove(attendeeToRemove),
      updatedAt: Timestamp.now(),
    });
  }
}

/**
 * Record check-in for attendee
 */
export async function recordAttendeeCheckIn(
  meetingId: string,
  attendeeUid: string
): Promise<void> {
  const meeting = await getMeeting(meetingId);
  if (!meeting) return;

  const updatedAttendees = meeting.attendees.map((att) => {
    if (att.uid === attendeeUid && !att.checkedIn) {
      return {
        ...att,
        checkedIn: true,
        checkInTime: Timestamp.now(),
      };
    }
    return att;
  });

  const meetingRef = doc(db, 'meetings', meetingId);
  await updateDoc(meetingRef, {
    attendees: updatedAttendees,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get attendance summary for a meeting
 */
export async function getMeetingAttendanceSummary(
  meetingId: string
): Promise<{
  total: number;
  checkedIn: number;
  absent: number;
  attendanceRate: number;
}> {
  const meeting = await getMeeting(meetingId);
  if (!meeting) {
    return { total: 0, checkedIn: 0, absent: 0, attendanceRate: 0 };
  }

  const total = meeting.attendees.length;
  const checkedIn = meeting.attendees.filter((att) => att.checkedIn).length;
  const absent = total - checkedIn;
  const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return { total, checkedIn, absent, attendanceRate };
}

/**
 * Get statistics for dashboard
 */
export async function getMeetingStats(userId: string): Promise<{
  totalMeetings: number;
  activeMeetings: number;
  archivedMeetings: number;
  totalAttendees: number;
  averageAttendanceRate: number;
}> {
  const meetings = await getMeetingsByCreator(userId);

  const activeMeetings = meetings.filter(
    (m) => m.status === 'active'
  ).length;
  const archivedMeetings = meetings.filter(
    (m) => m.status === 'archived'
  ).length;

  let totalAttendees = 0;
  let totalAttendanceRate = 0;

  for (const meeting of meetings) {
    totalAttendees += meeting.attendees.length;
    const summary = await getMeetingAttendanceSummary(meeting.id);
    totalAttendanceRate += summary.attendanceRate;
  }

  const averageAttendanceRate =
    meetings.length > 0
      ? Math.round(totalAttendanceRate / meetings.length)
      : 0;

  return {
    totalMeetings: meetings.length,
    activeMeetings,
    archivedMeetings,
    totalAttendees,
    averageAttendanceRate,
  };
}
