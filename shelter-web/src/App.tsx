import { useEffect, useState } from "react";

import { DashboardPage } from "./pages/DashboardPage";
import { BookingsPage } from "./pages/BookingsPage";
import { DogFormPage, DogsPage } from "./pages/DogsPage";
import { LoginPage } from "./pages/LoginPage";
import { HistoryPage, LivePage, ReportFormPage, ReportsPage } from "./pages/OperationsPage";
import { ScheduleFormPage, SchedulesPage } from "./pages/SchedulesPage";
import { SettingsPage, VerificationPage } from "./pages/SettingsPage";
import { PageLayout } from "./components/PageLayout";
import { useSession } from "./session";

// 로그인 없이 목업을 보는 버튼은 개발 서버에서 VITE_ALLOW_DEMO_PREVIEW=true일 때만 보인다.
const previewEnabled = import.meta.env.DEV && import.meta.env.VITE_ALLOW_DEMO_PREVIEW === "true";

export function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleNavigation = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", handleNavigation);
    return () => window.removeEventListener("hashchange", handleNavigation);
  }, []);

  const parts = hash.replace(/^#/, "").split("/");
  const [page, action, id] = parts;
  const { state, signedIn, preview } = useSession();
  const isLoginRoute = (!page || page === "login") && parts.length === 1;
  // 로그인 화면과 (로그인 화면에서 연결된) 보호소 인증 안내만 세션 없이 볼 수 있다.
  const isPublic = isLoginRoute || (page === "verification" && parts.length === 1);
  const needsLogin = !isPublic && state.status === "out";
  const alreadySignedIn = isLoginRoute && state.status === "in";

  useEffect(() => {
    if (needsLogin) window.location.hash = "login";
    else if (alreadySignedIn) window.location.hash = "dashboard";
  }, [needsLogin, alreadySignedIn]);

  if (!isPublic && state.status === "checking") return <div className="page-shell"><p className="empty-text" role="status">로그인 상태를 확인하고 있어요.</p></div>;
  if (isLoginRoute && state.status === "checking") return <div className="page-shell"><p className="empty-text" role="status">로그인 상태를 확인하고 있어요.</p></div>;
  if (alreadySignedIn) return null;
  if (isLoginRoute || needsLogin) {
    return <LoginPage
      onSignedIn={(me) => { signedIn(me); window.location.hash = "dashboard"; }}
      onPreview={previewEnabled ? () => { preview(); window.location.hash = "dashboard"; } : undefined}
      notice={state.status === "out" ? state.notice : undefined}
    />;
  }
  if (page === "dashboard" && parts.length === 1) return <DashboardPage />;
  if (page === "verification" && parts.length === 1) return <VerificationPage />;
  if (page === "dogs" && parts.length === 1) return <DogsPage />;
  if (page === "dogs" && action === "new" && parts.length === 2) return <DogFormPage key={hash} />;
  if (page === "dogs" && action === "edit" && id && parts.length === 3) return <DogFormPage key={hash} dogId={id} />;
  if (page === "schedules" && parts.length === 1) return <SchedulesPage />;
  if (page === "schedules" && action === "new" && parts.length === 2) return <ScheduleFormPage />;
  if (page === "bookings" && parts.length === 1) return <BookingsPage />;
  if (page === "bookings" && action && parts.length === 2) return <BookingsPage key={hash} bookingId={action} />;
  if (page === "live" && parts.length === 1) return <LivePage />;
  if (page === "reports" && parts.length === 1) return <ReportsPage />;
  if (page === "reports" && action === "new" && parts.length === 2) return <ReportFormPage />;
  if (page === "history" && parts.length === 1) return <HistoryPage />;
  if (page === "history" && action && parts.length === 2) return <HistoryPage key={hash} walkId={action} />;
  if (page === "settings" && parts.length === 1) return <SettingsPage />;
  return <PageLayout title="화면을 찾을 수 없어요" description="주소를 확인하거나 홈으로 이동해 주세요."><a className="secondary-link section-action" href="#dashboard">홈으로</a></PageLayout>;
}
