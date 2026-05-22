export enum PaceMode {
  SELF_PACED = 'self_paced',   // Unlock next day after completing current day.
  SCHEDULED = 'scheduled',     // Each day unlocks on a fixed calendar date.
  DEADLINE = 'deadline',       // Free pace but must finish by a deadline date.
}
