export const MOCK_SHELTER_CODES = ["428619"] as const;

export function isValidShelterCode(code: string): boolean {
  return MOCK_SHELTER_CODES.includes(code as (typeof MOCK_SHELTER_CODES)[number]);
}
