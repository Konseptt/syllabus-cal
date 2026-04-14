/**
 * icsGenerator.js
 * Generates RFC 5545 compliant .ics calendar files from extracted events.
 * Handles both all-day events and timed events.
 */

/**
 * Pad a number to 2 digits.
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Generate a simple unique ID for each event.
 */
function generateUID() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@syllabuscal`;
}

/**
 * Format a date string (YYYY-MM-DD) and optional time (HH:MM) into iCal format.
 * - Timed: 20250915T143000
 * - All-day: 20250915 (VALUE=DATE)
 */
function formatDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-');

  if (timeStr && timeStr.trim()) {
    const [hour, minute] = timeStr.split(':');
    return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
  }

  return `${year}${pad(month)}${pad(day)}`;
}

/**
 * Escape special characters in iCal text fields.
 */
function escapeICS(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Build a single VEVENT block.
 */
function buildEvent(event) {
  const lines = [];
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${generateUID()}`);
  lines.push(`DTSTAMP:${formatDateTime(new Date().toISOString().split('T')[0], '00:00')}`);

  const isAllDay = !event.time || !event.time.trim();

  if (isAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatDateTime(event.date)}`);
    // All-day events: DTEND is the next day (exclusive)
    const dt = new Date(event.date + 'T00:00:00');
    dt.setDate(dt.getDate() + 1);
    const nextDay = dt.toISOString().split('T')[0];
    lines.push(`DTEND;VALUE=DATE:${formatDateTime(nextDay)}`);
  } else {
    lines.push(`DTSTART:${formatDateTime(event.date, event.time)}`);

    if (event.endTime && event.endTime.trim()) {
      lines.push(`DTEND:${formatDateTime(event.date, event.endTime)}`);
    } else {
      // Default to 1 hour duration
      const [h, m] = event.time.split(':').map(Number);
      const endH = h + 1;
      lines.push(`DTEND:${formatDateTime(event.date, `${pad(endH)}:${pad(m)}`)}`);
    }
  }

  lines.push(`SUMMARY:${escapeICS(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }

  // Map event type to iCal category
  const categoryMap = {
    exam: 'EXAM',
    assignment: 'ASSIGNMENT',
    reading: 'READING',
    lab: 'LAB',
    lecture: 'LECTURE',
    other: 'OTHER',
  };
  lines.push(`CATEGORIES:${categoryMap[event.type] || 'OTHER'}`);

  // Add a reminder — 1 day before for exams, 2 hours for everything else
  if (event.type === 'exam') {
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P1D');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)} tomorrow`);
    lines.push('END:VALARM');
  } else {
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT2H');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)}`);
    lines.push('END:VALARM');
  }

  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Generate a complete .ics file string from an array of events.
 * @param {Array} events - Array of event objects
 * @param {string} calendarName - Name for the calendar
 * @returns {string} - Complete .ics file content
 */
export function generateICS(events, calendarName = 'Syllabus Calendar') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SyllabusCal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
  ];

  for (const event of events) {
    lines.push(buildEvent(event));
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger a browser download of the .ics file.
 * @param {Array} events - Array of event objects to export
 * @param {string} courseName - Course name for the filename
 */
export function downloadICS(events, courseName = 'syllabus') {
  const icsContent = generateICS(events, courseName);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${courseName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_calendar.ics`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
