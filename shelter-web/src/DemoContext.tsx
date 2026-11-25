import { createContext, useContext, useState, type ReactNode } from "react";

import {
  initialBookings, initialDogs, initialReports, initialSchedules, initialWalks,
  type DemoBooking, type DemoDog, type DemoReport, type DemoSchedule, type DemoWalk,
} from "./data/demo";

type DemoContextValue = {
  dogs: DemoDog[];
  schedules: DemoSchedule[];
  bookings: DemoBooking[];
  updateBooking: (id: string, status: DemoBooking["status"]) => void;
  reports: DemoReport[];
  addReport: (report: DemoReport) => void;
  reviewReport: (id: string) => void;
  walks: DemoWalk[];
  saveEvaluation: (id: string, evaluation: string) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [dogs] = useState(initialDogs);
  const [schedules] = useState(initialSchedules);
  const [bookings, setBookings] = useState(initialBookings);
  const [reports, setReports] = useState(initialReports);
  const [walks, setWalks] = useState(initialWalks);

  return (
    <DemoContext.Provider value={{
      dogs,
      schedules,
      bookings, updateBooking: (id, status) => setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking)),
      reports, addReport: (report) => setReports((current) => [report, ...current]),
      reviewReport: (id) => setReports((current) => current.map((report) => report.id === id ? { ...report, reviewed: true } : report)),
      walks, saveEvaluation: (id, evaluation) => setWalks((current) => current.map((walk) => walk.id === id ? { ...walk, evaluation } : walk)),
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is missing.");
  return context;
}
