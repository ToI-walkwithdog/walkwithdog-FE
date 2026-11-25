import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiFailure } from "../api/client";
import { failureText } from "../api/failure";
import { mediaUrl } from "../api/client";
import {
  cancelReasonLabel, fetchShelterRequests, fetchWalkRequest, PAGE_SIZE, rejectionReasonLabel, statusLabel, STATUS_TABS,
  type RequestStatus, type WalkRequestDetail, type WalkRequestItem,
} from "../api/walkRequests";
import { LoadView, NoServerNotice } from "../components/LoadView";
import { PageLayout } from "../components/PageLayout";
import { useLoad } from "../hooks";
import { useShelterId } from "../session";
import { formatKst, formatKstRange } from "../time";

// 목록에서 상세로 갔다가 돌아와도 보던 탭이 유지되도록 마지막 탭만 기억한다(민감하지 않은 값).
let lastTab: RequestStatus = "PENDING";

export function BookingsPage({ bookingId }: { bookingId?: string }) {
  const shelterId = useShelterId();
  if (shelterId === null) {
    return <PageLayout title="예약 관리" description="서버와 연결된 계정에서만 쓸 수 있어요." back="#dashboard"><NoServerNotice /></PageLayout>;
  }
  if (bookingId) return <BookingDetailPage bookingId={bookingId} />;
  return (
    <PageLayout title="예약 관리" description="봉사자의 산책 신청을 확인해요.">
      <BookingList shelterId={shelterId} />
    </PageLayout>
  );
}

function DogThumb({ item }: { item: WalkRequestItem }) {
  const url = mediaUrl(item.dog?.image_url);
  return url ? <img className="dog-photo" src={url} alt={`${item.dog?.name ?? "강아지"} 사진`} /> : <div className="dog-photo photo-empty">사진 없음</div>;
}

function BookingList({ shelterId }: { shelterId: string }) {
  const [tab, setTab] = useState<RequestStatus>(lastTab);
  const [items, setItems] = useState<WalkRequestItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiFailure | null>(null);
  const ticket = useRef(0);

  // 최신순 목록을 PAGE_SIZE씩 이어 붙인다. offset이 0이면 처음부터 다시 불러온다.
  const load = useCallback(async (status: RequestStatus, offset: number) => {
    const mine = ++ticket.current;
    setLoading(true);
    setError(null);
    const res = await fetchShelterRequests(shelterId, status, offset);
    if (mine !== ticket.current) return;
    setLoading(false);
    if (!res.ok) { setError(res); return; }
    setHasMore(res.data.length >= PAGE_SIZE);
    setItems((current) => {
      if (offset === 0) return res.data;
      const known = new Set(current.map((item) => item.id));
      return [...current, ...res.data.filter((item) => !known.has(item.id))];
    });
  }, [shelterId]);

  useEffect(() => {
    lastTab = tab;
    setItems([]);
    setHasMore(false);
    void load(tab, 0);
  }, [tab, load]);

  return (
    <>
      <div className="tab-row section-action" role="tablist">
        {STATUS_TABS.map((item) => (
          <button key={item.status} type="button" role="tab" aria-selected={tab === item.status} className={`tab-button${tab === item.status ? " active" : ""}`} onClick={() => setTab(item.status)}>{item.label}</button>
        ))}
      </div>
      <div className="content-list">
        {items.map((item) => (
          <article className="content-card" key={item.id}>
            <div className="dog-summary">
              <DogThumb item={item} />
              <div>
                <div className="card-title-row"><h2>{item.dog?.name ?? "강아지"} 산책</h2><span className="small-badge">{statusLabel(item)}</span></div>
                <p className="muted">{formatKstRange(item.requested_start_at, item.requested_end_at)}</p>
                <p className="muted">신청 {formatKst(item.created_at)}</p>
              </div>
            </div>
            <a className="inline-link" href={`#bookings/${item.id}`}>상세 보기</a>
          </article>
        ))}
        {!loading && !error && items.length === 0 ? <p className="empty-text">이 상태의 신청이 없어요.</p> : null}
        {loading ? <p className="empty-text" role="status">불러오는 중이에요.</p> : null}
        {error ? (
          <div className="content-card">
            <p className="form-error" role="alert">{failureText(error)}</p>
            <button className="small-action section-action" type="button" onClick={() => void load(tab, items.length)}>다시 불러오기</button>
          </div>
        ) : null}
        {!loading && !error && hasMore ? <button className="small-action" type="button" onClick={() => void load(tab, items.length)}>더 보기</button> : null}
      </div>
    </>
  );
}

function ExperienceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <>정보 없음</>;
  if (typeof value === "boolean") return <>{value ? "있음" : "없음"}</>;
  return <>{typeof value === "object" ? JSON.stringify(value) : String(value)}</>;
}

function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const { state, reload } = useLoad(() => fetchWalkRequest(bookingId), [bookingId]);
  return (
    <PageLayout title="신청 상세" description="신청자와 일정을 확인해요." back="#bookings">
      <LoadView state={state} onRetry={reload}>{(request) => <BookingDetail request={request} />}</LoadView>
    </PageLayout>
  );
}

function BookingDetail({ request }: { request: WalkRequestDetail }) {
  const applicant = request.applicant;
  const rejection = rejectionReasonLabel(request.rejection_reason_code);
  const cancel = cancelReasonLabel(request.cancel_reason_code);
  return (
    <article className="content-card section-action">
      <div className="card-title-row"><h2>{request.dog?.name ?? "강아지"} 산책</h2><span className="small-badge">{statusLabel(request)}</span></div>
      <dl className="details-list">
        <div><dt>일정</dt><dd>{formatKstRange(request.requested_start_at, request.requested_end_at)}</dd></div>
        <div><dt>신청 시각</dt><dd>{formatKst(request.created_at)}</dd></div>
        <div><dt>신청자</dt><dd>{applicant?.nickname ?? "정보 없음"}</dd></div>
        <div><dt>반려견 경험</dt><dd><ExperienceValue value={applicant?.dog_experience} /></dd></div>
        <div><dt>경험한 견종</dt><dd><ExperienceValue value={applicant?.experienced_breed} /></dd></div>
        <div><dt>산책 빈도</dt><dd><ExperienceValue value={applicant?.walk_frequency} /></dd></div>
        {request.max_walk_minutes ? <div><dt>최대 산책</dt><dd>{request.max_walk_minutes}분</dd></div> : null}
        {request.status === "REJECTED" ? <div><dt>거절 사유</dt><dd>{[rejection, request.rejection_reason].filter(Boolean).join(" · ") || "사유 없음"}</dd></div> : null}
        {request.status === "CANCELLED" ? <div><dt>취소</dt><dd>{[cancel, request.cancelled_at ? formatKst(request.cancelled_at) : null].filter(Boolean).join(" · ") || "사유 없음"}</dd></div> : null}
      </dl>
      {request.status === "PENDING" ? (
        <>
          <div className="card-actions">
            <button className="small-action" type="button" disabled>승인</button>
            <button className="small-action" type="button" disabled>거절</button>
          </div>
          <p className="field-hint">승인과 거절은 아직 연결되지 않았어요.</p>
        </>
      ) : <p className="field-hint">이 신청은 처리가 끝났어요.</p>}
      <p className="field-hint">신청자의 이름과 나이는 보호소에 공개되지 않아요.</p>
    </article>
  );
}
