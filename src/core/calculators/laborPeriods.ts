interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function parseIsoDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;
  return { year, month, day };
}

function monthIndex(date: CalendarDate) {
  return (date.year * 12) + date.month - 1;
}

/**
 * Obtiene los meses calendario completos laborados dentro del semestre de cese.
 * Enero-junio corresponde a la gratificación de julio y julio-diciembre a Navidad.
 */
export function calculateCompleteGratificationMonths(
  employmentStartIso: string,
  terminationIso: string,
): number | null {
  const employmentStart = parseIsoDate(employmentStartIso);
  const termination = parseIsoDate(terminationIso);
  if (!employmentStart || !termination || monthIndex(employmentStart) > monthIndex(termination)) return null;
  if (monthIndex(employmentStart) === monthIndex(termination) && employmentStart.day > termination.day) return null;

  const semesterStartMonth = termination.month <= 6 ? 1 : 7;
  const semesterStart: CalendarDate = { year: termination.year, month: semesterStartMonth, day: 1 };
  const effectiveStart = monthIndex(employmentStart) < monthIndex(semesterStart)
    ? semesterStart
    : employmentStart;

  let firstEligibleMonth = monthIndex(effectiveStart);
  if (effectiveStart.day !== 1) firstEligibleMonth += 1;

  let lastEligibleMonth = monthIndex(termination);
  const lastDayOfTerminationMonth = new Date(Date.UTC(termination.year, termination.month, 0)).getUTCDate();
  if (termination.day !== lastDayOfTerminationMonth) lastEligibleMonth -= 1;

  return Math.max(0, Math.min(6, lastEligibleMonth - firstEligibleMonth + 1));
}
