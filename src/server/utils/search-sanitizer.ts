/**
 * Utility to sanitize search inputs before interpolating into PostgREST filters.
 * Prevents PostgREST syntax injection (e.g., in `.or()` conditions) and wildcards.
 */
export function sanitizePostgrestSearch(rawQuery?: string | null, maxLength = 60): string {
  if (!rawQuery || typeof rawQuery !== 'string') return '';

  // 1. Normalize Unicode and whitespace
  let clean = rawQuery.normalize('NFKC').trim();

  // 2. Remove characters that have special syntactic meaning in PostgREST or SQL ILIKE
  // Parentheses '()', commas ',', double quotes '"', colons ':', backslashes '\\',
  // dots '.', percent '%', underscore '_', semicolons ';', single quotes '\''
  clean = clean.replace(/[\(\),":\\.%_;']/g, ' ');

  // 3. Collapse multiple whitespace characters into single space
  clean = clean.replace(/\s+/g, ' ').trim();

  // 4. Enforce strict maximum length
  return clean.slice(0, maxLength);
}
