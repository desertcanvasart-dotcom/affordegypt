// Ready-made programs cannot run during the annual holiday exclusion.
export function packageDatesAvailable(departure: string, durationDays: number): boolean {
  const start = new Date(`${departure}T00:00:00Z`);
  if (!Number.isFinite(start.getTime()) || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 60) return false;
  for (let i = 0; i < durationDays; i++) {
    const day = new Date(start.getTime() + i * 86400000);
    const month = day.getUTCMonth();
    const date = day.getUTCDate();
    if ((month === 11 && date >= 24) || (month === 0 && date <= 7)) return false;
  }
  return true;
}
