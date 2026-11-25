// Idempotency-Key, client_marker_id, client_report_id에 쓰는 UUID v4(소문자).
// 보안용 난수가 아니라 중복 요청 구분용이라 Math.random으로 충분하다.
export function newUuid(): string {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID().toLowerCase();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}
