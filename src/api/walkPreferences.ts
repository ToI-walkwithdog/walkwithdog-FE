import { api } from "./client";

// GET /users/me/walk-preferences. 이번 단계에서는 적용값(effective_preferences)만 읽는다.
export type WalkPreferences = {
  configured: boolean;
  version: number;
  effective_preferences: {
    duration_code: string | null;
    size_code: string | null;
  };
};

export function fetchWalkPreferences() {
  return api.get<WalkPreferences>("/users/me/walk-preferences");
}
