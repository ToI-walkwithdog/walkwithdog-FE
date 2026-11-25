import * as SecureStore from "expo-secure-store";

// 첫 산책 가이드(4-guide)를 이미 본 계정을 "계정 ID"로 기억해 홈의 "산책 시작하개"에서 한 번만 보여 준다.
// levelUpSeen.ts와 같은 방식이다: 앱을 다시 시작해도 남도록 expo-secure-store에 짧은 ID 목록(최대 50개)으로 둔다.
// 이 값은 이 기기에만 있다. 새 기기나 앱을 지우고 다시 설치하면 비어 있으므로 가이드가 한 번 더 보인다(서버에는 저장하지 않는다).
// 저장소를 쓸 수 없으면(웹 등) 조용히 실패하고, 그때는 이번 실행 동안만 메모리로 기억한다.
const KEY = "walk_guide_seen";
const MAX_ENTRIES = 50;

const memory = new Set<string>();

async function read(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function hasSeenWalkGuide(userId: number): Promise<boolean> {
  if (memory.has(String(userId))) return true;
  return (await read()).includes(String(userId));
}

export async function markWalkGuideSeen(userId: number): Promise<void> {
  memory.add(String(userId));
  try {
    const list = (await read()).filter((item) => item !== String(userId));
    list.push(String(userId));
    await SecureStore.setItemAsync(KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    // ignore
  }
}
