export type Facts = Record<string, unknown>;
export type Issue = { field: string; code: string; message: string };
export function validateFacts(facts: Facts): Issue[] {
  const issues: Issue[] = [];
  for (const [key, value] of Object.entries(facts)) {
    if (typeof value === "string" && value.length > 10000) {
      issues.push({ field: key, code: "too_long", message: "Value exceeds the allowed length" });
    }
    if (typeof value === "string" && /(?:date_of_birth|birth_date)$/i.test(key) && value.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      issues.push({ field: key, code: "date_format", message: "Use YYYY-MM-DD" });
    }
  }
  return issues;
}
