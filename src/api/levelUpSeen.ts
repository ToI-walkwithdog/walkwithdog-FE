import * as SecureStore from "expo-secure-store";

// 이미 보여 준 레벨업 이벤트를 "계정 ID:이벤트 ID"로 기억해 같은 레벨업 화면(6-3)을 되풀이하지 않는다.
// 앱을 다시 시작해도 남아야 해서 메모리가 아니라 expo-secure-store(이미 토큰 저장에 쓴다)에 둔다.
// 값은 짧은 ID 목록(최대 50개, 1KB 안팎)이라 SecureStore 크기 제한 안에 든다.
// 저장소를 쓸 수 없으면(웹 등) 조용히 실패하고, 그때는 이번 실행 동안만 메모리로 기억한다.
const KEY = "level_up_seen";
const MAX_ENTRIES = 50;

const memory = new Set<string>();

function entry(userId: number, eventId: number) {
  return `${userId}:${eventId}`;
}

async function read(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function hasSeenLevelUp(userId: number, eventId: number): Promise<boolean> {
  if (memory.has(entry(userId, eventId))) return true;
  return (await read()).includes(entry(userId, eventId));
}

export async function markLevelUpSeen(userId: number, eventId: number): Promise<void> {
  memory.add(entry(userId, eventId));
  try {
    const list = (await read()).filter((item) => item !== entry(userId, eventId));
    list.push(entry(userId, eventId));
    await SecureStore.setItemAsync(KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    // ignore
  }
}
