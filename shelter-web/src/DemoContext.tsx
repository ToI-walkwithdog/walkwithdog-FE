import { createContext, useContext, useState, type ReactNode } from "react";

import {
  initialBookings, initialDogs, initialReports, initialSchedules, initialShelter, initialWalks,
  type DemoBooking, type DemoDog, type DemoReport, type DemoSchedule, type DemoShelter, type DemoWalk,
} from "./data/demo";

type DemoContextValue = {
  shelter: DemoShelter;
  setShelter: (shelter: DemoShelter) => void;
  dogs: DemoDog[];
  saveDog: (dog: DemoDog) => void;
  toggleDog: (id: string) => void;
  schedules: DemoSchedule[];
  addSchedule: (schedule: DemoSchedule) => void;
  toggleSchedule: (id: string) => void;
  bookings: DemoBooking[];
  updateBooking: (id: string, status: DemoBooking["status"]) => void;
  reports: DemoReport[];
  addReport: (report: DemoReport) => void;
  reviewReport: (id: string) => void;
  walks: DemoWalk[];
  saveEvaluation: (id: string, evaluation: string) => void;
  reset: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [shelter, setShelter] = useState(initialShelter);
  const [dogs, setDogs] = useState(initialDogs);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [bookings, setBookings] = useState(initialBookings);
  const [reports, setReports] = useState(initialReports);
  const [walks, setWalks] = useState(initialWalks);

  const saveDog = (dog: DemoDog) => setDogs((current) =>
    current.some((item) => item.id === dog.id)
      ? current.map((item) => item.id === dog.id ? dog : item)
      : [...current, dog],
  );
  const reset = () => {
    setShelter(initialShelter);
    setDogs(initialDogs);
    setSchedules(initialSchedules);
    setBookings(initialBookings);
    setReports(initialReports);
    setWalks(initialWalks);
  };

  return (
    <DemoContext.Provider value={{
      shelter, setShelter, dogs, saveDog,
      toggleDog: (id) => setDogs((current) => current.map((dog) => dog.id === id ? { ...dog, active: !dog.active } : dog)),
      schedules, addSchedule: (schedule) => setSchedules((current) => [...current, schedule]),
      toggleSchedule: (id) => setSchedules((current) => current.map((schedule) => schedule.id === id ? { ...schedule, active: !schedule.active } : schedule)),
      bookings, updateBooking: (id, status) => setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking)),
      reports, addReport: (report) => setReports((current) => [report, ...current]),
      reviewReport: (id) => setReports((current) => current.map((report) => report.id === id ? { ...report, reviewed: true } : report)),
      walks, saveEvaluation: (id, evaluation) => setWalks((current) => current.map((walk) => walk.id === id ? { ...walk, evaluation } : walk)),
      reset,
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
