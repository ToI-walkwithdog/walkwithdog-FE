import { createContext, useContext, useState, type ReactNode } from "react";

import {
  initialReports, initialWalks,
  type DemoReport, type DemoWalk,
} from "./data/demo";

type DemoContextValue = {
  reports: DemoReport[];
  addReport: (report: DemoReport) => void;
  reviewReport: (id: string) => void;
  walks: DemoWalk[];
  saveEvaluation: (id: string, evaluation: string) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState(initialReports);
  const [walks, setWalks] = useState(initialWalks);

  return (
    <DemoContext.Provider value={{
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
