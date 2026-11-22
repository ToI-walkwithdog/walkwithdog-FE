import { useEffect, useState } from "react";

import { DashboardPage } from "./pages/DashboardPage";
import { BookingsPage } from "./pages/BookingsPage";
import { DogFormPage, DogsPage } from "./pages/DogsPage";
import { LoginPage } from "./pages/LoginPage";
import { HistoryPage, LivePage, ReportFormPage, ReportsPage } from "./pages/OperationsPage";
import { ScheduleFormPage, SchedulesPage } from "./pages/SchedulesPage";
import { SettingsPage, VerificationPage } from "./pages/SettingsPage";
import { PageLayout } from "./components/PageLayout";

export function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleNavigation = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", handleNavigation);
    return () => window.removeEventListener("hashchange", handleNavigation);
  }, []);

  const parts = hash.replace(/^#/, "").split("/");
  const [page, action, id] = parts;
  if ((!page || page === "login") && parts.length === 1) return <LoginPage onPreview={() => { window.location.hash = "dashboard"; }} />;
  if (page === "dashboard" && parts.length === 1) return <DashboardPage onExit={() => { window.location.hash = ""; }} />;
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
