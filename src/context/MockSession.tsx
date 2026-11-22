import { createContext, useContext, useState, type ReactNode } from "react";

import { availableBookings, type AvailableBooking } from "../data/availableBookings";
import { walkRecords } from "../data/walkRecords";
import { cancelMockBooking, createMockBooking, createMockWalkRecord, type MockBooking, type MockWalkRecord } from "./mockSessionLogic";
type MockProfile = { nickname: string; name: string; phone: string };
type DogSize = "소형견" | "중형견" | "대형견";
type MockPreferences = { duration: string; size: DogSize; region: string };

const initialProfile: MockProfile = { nickname: "Glow", name: "", phone: "" };

type MockSessionValue = {
  bookings: MockBooking[];
  selectedBooking: MockBooking | undefined;
  selectBooking: (id: string) => void;
  cancelBooking: () => void;
  draftDogId: AvailableBooking["dogId"];
  draftScheduleIndex: number;
  selectDog: (id: AvailableBooking["dogId"]) => void;
  selectSchedule: (index: number) => void;
  applyForBooking: () => void;
  records: MockWalkRecord[];
  selectedRecord: MockWalkRecord | undefined;
  selectRecord: (id: string) => void;
  saveRecord: (message: string) => void;
  addMarker: (label: string) => void;
  clearMarkers: () => void;
  profile: MockProfile;
  updateProfile: (profile: MockProfile) => void;
  preferences: MockPreferences | null;
  updatePreferences: (preferences: MockPreferences) => void;
  resetSession: () => void;
};

const initialBookings: MockBooking[] = [
  { id: "confirmed", dogId: "kongi", schedule: availableBookings[0].schedules[0], status: "confirmed" },
  { id: "pending", dogId: "kongi", schedule: availableBookings[0].schedules[1], status: "pending" },
  { id: "rejected", dogId: "kongi", schedule: availableBookings[0].schedules[0], status: "rejected" },
  { id: "cancelled", dogId: "bori", schedule: availableBookings[2].schedules[1], status: "cancelled" },
];

const MockSessionContext = createContext<MockSessionValue | null>(null);

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBookingId, setSelectedBookingId] = useState("confirmed");
  const [draftDogId, setDraftDogId] = useState<AvailableBooking["dogId"]>("kongi");
  const [draftScheduleIndex, setDraftScheduleIndex] = useState(1);
  const [records, setRecords] = useState<MockWalkRecord[]>(walkRecords);
  const [selectedRecordId, setSelectedRecordId] = useState(walkRecords[0].id);
  const [markers, setMarkers] = useState<string[]>([]);
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState<MockPreferences | null>(null);
  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId);

  const selectDog = (id: AvailableBooking["dogId"]) => {
    setDraftDogId(id);
    setDraftScheduleIndex(0);
  };

  const applyForBooking = () => {
    const booking = createMockBooking(availableBookings, draftDogId, draftScheduleIndex, `mock-${Date.now()}-${Math.random()}`);
    setBookings((current) => [booking, ...current]);
    setSelectedBookingId(booking.id);
  };

  const cancelBooking = () => {
    setBookings((current) => cancelMockBooking(current, selectedBookingId));
  };

  const saveRecord = (message: string) => {
    const now = new Date();
    const record = createMockWalkRecord(message, markers, now, `mock-walk-${now.getTime()}-${Math.random()}`);
    setRecords((current) => [record, ...current]);
    setSelectedRecordId(record.id);
    setMarkers([]);
  };

  const resetSession = () => {
    setBookings(initialBookings);
    setSelectedBookingId("confirmed");
    setDraftDogId("kongi");
    setDraftScheduleIndex(1);
    setRecords(walkRecords);
    setSelectedRecordId(walkRecords[0].id);
    setMarkers([]);
    setProfile(initialProfile);
    setPreferences(null);
  };

  return (
    <MockSessionContext.Provider value={{
      bookings, selectedBooking, selectBooking: setSelectedBookingId, cancelBooking,
      draftDogId, draftScheduleIndex, selectDog, selectSchedule: setDraftScheduleIndex,
      applyForBooking, records, selectedRecord: records.find((record) => record.id === selectedRecordId),
      selectRecord: setSelectedRecordId, saveRecord,
      addMarker: (label) => setMarkers((current) => [...current, label]),
      clearMarkers: () => setMarkers([]),
      profile, updateProfile: setProfile, preferences, updatePreferences: setPreferences, resetSession,
    }}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const session = useContext(MockSessionContext);
  if (!session) throw new Error("MockSessionProvider is missing.");
  return session;
}
