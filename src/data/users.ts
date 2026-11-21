export const MOCK_TAKEN_IDS = [
  "gobutter",
  "admin",
  "test",
  "boribori",
] as const;

export function checkMockIdAvailability(id: string): boolean {
  const normalizedId = id.trim().toLowerCase();
  return !MOCK_TAKEN_IDS.some((takenId) => takenId === normalizedId);
}
