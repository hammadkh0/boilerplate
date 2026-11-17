/** The oldest createdAt that a retention job should keep. Rows older than this are deleted. */
export function requestLogCutoff(now: Date, retentionDays: number): Date {
  return new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
}
