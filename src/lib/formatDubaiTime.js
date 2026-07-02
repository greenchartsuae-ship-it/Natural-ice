const DUBAI_TZ = 'Asia/Dubai';

/**
 * Format a date string in Dubai timezone.
 * @param {string|Date} dateStr
 * @param {'datetime'|'date'|'time'|'short'} mode
 */
export function formatDubai(dateStr, mode = 'datetime') {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  if (mode === 'datetime') {
    const datePart = new Intl.DateTimeFormat('en-GB', {
      timeZone: DUBAI_TZ,
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).format(date);
    const timePart = new Intl.DateTimeFormat('en-US', {
      timeZone: DUBAI_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
    return `${datePart} · ${timePart}`;
  }

  if (mode === 'short') {
    const datePart = new Intl.DateTimeFormat('en-GB', {
      timeZone: DUBAI_TZ,
      day: '2-digit',
      month: 'short',
    }).format(date);
    const timePart = new Intl.DateTimeFormat('en-US', {
      timeZone: DUBAI_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
    return `${datePart} · ${timePart}`;
  }

  if (mode === 'date') {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: DUBAI_TZ,
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).format(date);
  }

  if (mode === 'time') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: DUBAI_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  return date.toLocaleString('en-US', { timeZone: DUBAI_TZ, hour12: true });
}