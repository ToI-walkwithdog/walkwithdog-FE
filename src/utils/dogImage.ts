import { API_BASE_URL } from "../api/client";

// 서버의 image_url은 공공데이터 강아지는 전체 주소, 보호소가 올린 사진은 /media/dogs/... 상대 경로다.
// 사진이 없으면 null이고, 화면이 자리 표시 아이콘을 그린다.
export function dogImageSource(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return { uri: imageUrl };
  if (imageUrl.startsWith("/")) return { uri: `${API_BASE_URL}${imageUrl}` };
  return null;
}
