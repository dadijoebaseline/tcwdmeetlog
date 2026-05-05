'use client';

import type { MeetingAttendee } from './meeting-service';
import type { UserProfile } from './auth-context';

export interface MeetingExportData {
  title: string;
  venue: string;
  date: string;
  time: string;
  description?: string;
  attendees: MeetingAttendee[];
  allUsers: UserProfile[];
}

/** Load logo as base64 + natural dimensions */
async function loadLogo(): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch('/official-logo.png');
    const blob = await res.blob();
    const data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    // Get natural pixel dimensions via an Image element
    const { w, h } = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = data;
    });
    return { data, w, h };
  } catch {
    return null;
  }
}

/** Format a Firestore Timestamp-like object to "HH:MM AM/PM" */
function formatTime(ts: any): string {
  if (!ts) return '';
  try {
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts.seconds * 1000);
    return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/** Format meeting date string "YYYY-MM-DD" to "Month DD, YYYY" */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export async function exportAttendancePDF(data: MeetingExportData): Promise<void> {
  // Dynamic import — jsPDF is browser-only
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 14;
  const marginR = 14;
  const contentW = pageW - marginL - marginR;

  // ── HEADER ────────────────────────────────────────────────────────────────
  const logo = await loadLogo();
  const logoTargetH = 20; // fixed rendered height in mm
  const logoW = logo ? (logo.w / logo.h) * logoTargetH : 0; // proportional width
  const headerTop = 10;

  if (logo) {
    doc.addImage(logo.data, 'PNG', marginL, headerTop, logoW, logoTargetH);
  }

  // Center text on full page width (independent of logo)
  const pageCenter = pageW / 2;

  // "TOLEDO CITY WATER DISTRICT" — centered on page
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOLEDO CITY WATER DISTRICT', pageCenter, headerTop + 7, { align: 'center' });

  // "A T T E N D A N C E" — centered on page
  doc.setFontSize(18);
  doc.setCharSpace(5);
  doc.text('ATTENDANCE', pageCenter, headerTop + 16, { align: 'center' });
  doc.setCharSpace(0);

  // Divider
  const dividerY = headerTop + logoTargetH + 4;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(marginL, dividerY, pageW - marginR, dividerY);

  // ── MEETING META ──────────────────────────────────────────────────────────
  let y = dividerY + 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Title :', marginL, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.title, marginL + 14, y);

  // "Page 1 of 1" on the right
  doc.setFont('helvetica', 'normal');
  doc.text('Page 1 of 1', pageW - marginR, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Venue :', marginL, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.venue, marginL + 14, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Date(s) :', marginL, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(data.date), marginL + 16, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Time :', marginL, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.time, marginL + 14, y);

  y += 5;
  doc.setLineWidth(0.3);
  doc.setDrawColor(180, 180, 180);
  doc.line(marginL, y, pageW - marginR, y);
  y += 4;

  // ── TOPICS TABLE ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOPICS / AGENDA', marginL, y);
  y += 5; // gap between label and table header

  autoTable(doc, {
    startY: y,
    margin: { left: marginL, right: marginR },
    head: [['#', 'Topics', 'Date / Time', 'Resource Speaker']],
    body: [
      [
        '1',
        data.description || data.title,
        `${formatDate(data.date)}\n${data.time}`,
        '',
      ],
    ],
    headStyles: {
      fillColor: [30, 80, 160],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: contentW * 0.45 },
      2: { cellWidth: contentW * 0.28 },
      3: { cellWidth: contentW * 0.22 },
    },
    theme: 'grid',
  });

  // ── ATTENDANCE TABLE ───────────────────────────────────────────────────────
  const afterTopics = (doc as any).lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ATTENDANCE RECORD', marginL, afterTopics);

  // Build rows
  const userMap = new Map(data.allUsers.map((u) => [u.uid, u]));

  // Sort: checked-in first, then by name
  const sorted = [...data.attendees].sort((a, b) => {
    if (a.checkedIn === b.checkedIn) return a.name.localeCompare(b.name);
    return a.checkedIn ? -1 : 1;
  });

  const rows = sorted.map((att, i) => {
    const profile = userMap.get(att.uid);
    const inTime = att.checkedIn && att.checkInTime ? formatTime(att.checkInTime) : '';
    return [
      String(i + 1),
      att.name || '',
      profile?.department || '',
      profile?.position || '',
      inTime,
      '', // OUT — always blank
      '', // SIGNATURE — always blank
    ];
  });

  // If fewer than 16 rows, pad with empty rows to match the template
  while (rows.length < 16) {
    rows.push([String(rows.length + 1), '', '', '', '', '', '']);
  }

  autoTable(doc, {
    startY: afterTopics + 5,
    margin: { left: marginL, right: marginR },
    head: [['#', 'Name', 'Department', 'Position', 'IN', 'OUT', 'SIGNATURE']],
    body: rows,
    headStyles: {
      fillColor: [30, 80, 160],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, minCellHeight: 8 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: contentW * 0.24 },
      2: { cellWidth: contentW * 0.2 },
      3: { cellWidth: contentW * 0.18 },
      4: { cellWidth: contentW * 0.1 },
      5: { cellWidth: contentW * 0.1 },
      6: { cellWidth: contentW * 0.15 },
    },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    theme: 'grid',
    // Highlight checked-in rows in light green
    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        const attIdx = hookData.row.index;
        if (attIdx < sorted.length && sorted[attIdx]?.checkedIn) {
          hookData.cell.styles.fillColor = [220, 250, 220];
        }
      }
    },
  });

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(
      `Toledo City Water District — Attendance Record   |   Generated: ${new Date().toLocaleString('en-PH')}`,
      marginL,
      doc.internal.pageSize.getHeight() - 6
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageW - marginR,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'right' }
    );
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const safeTitle = data.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  doc.save(`Attendance-${safeTitle}-${data.date}.pdf`);
}
