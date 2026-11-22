import { PageLayout } from "../components/PageLayout";
import { useDemo } from "../DemoContext";
import type { DemoBooking } from "../data/demo";

const statusNames: Record<DemoBooking["status"], string> = {
  pending: "승인 대기", confirmed: "승인 예시", rejected: "거절 예시", cancelled: "취소 예시",
};

export function BookingsPage({ bookingId }: { bookingId?: string }) {
  const { bookings, dogs, schedules, updateBooking } = useDemo();
  const selected = bookingId ? bookings.find((booking) => booking.id === bookingId) : undefined;
  if (bookingId && !selected) {
    return <PageLayout title="신청 정보 없음" description="요청한 예시 신청을 찾을 수 없어요." back="#bookings"><a className="secondary-link section-action" href="#bookings">예약 목록</a></PageLayout>;
  }
  const entries = selected ? [selected] : bookings;
  return (
    <PageLayout title={selected ? "신청 상세" : "예약 관리"} description="신청자와 일정을 확인하고 목업 상태를 변경해요." back={selected ? "#bookings" : "#dashboard"}>
      <div className="content-list">
        {entries.length === 0 ? <p className="empty-text">예시 신청이 없어요.</p> : null}
        {entries.map((booking) => {
          const dog = dogs.find((item) => item.id === booking.dogId);
          const schedule = schedules.find((item) => item.id === booking.scheduleId);
          return (
            <article className="content-card" key={booking.id}>
              <div className="card-title-row"><h2>{dog?.name ?? "알 수 없는 강아지"} 산책</h2><span className="small-badge">{statusNames[booking.status]}</span></div>
              <dl className="details-list">
                <div><dt>신청자</dt><dd>{booking.applicant}</dd></div>
                <div><dt>나이</dt><dd>{booking.age}살</dd></div>
                <div><dt>산책 경험</dt><dd>{booking.experience}</dd></div>
                <div><dt>일정</dt><dd>{schedule ? `${schedule.date} ${schedule.start}–${schedule.end}` : "일정 없음"}</dd></div>
                <div><dt>최대 산책</dt><dd>{schedule ? `${schedule.maxMinutes}분` : "확인 불가"}</dd></div>
              </dl>
              {!selected ? <a className="inline-link" href={`#bookings/${booking.id}`}>상세 및 처리</a> : null}
              {selected && booking.status === "pending" ? (
                <div className="card-actions">
                  <button className="small-action" type="button" onClick={() => updateBooking(booking.id, "confirmed")}>목업 승인</button>
                  <button className="small-action" type="button" onClick={() => updateBooking(booking.id, "rejected")}>목업 거절</button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="notice-box"><strong>연결 전 안내</strong><p>승인과 거절은 예시 상태만 바꿔요. 앱 알림과 보호소 코드 발급은 연결되지 않았어요.</p></div>
    </PageLayout>
  );
}
