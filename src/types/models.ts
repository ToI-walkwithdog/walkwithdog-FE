import type { ImageSourcePropType } from "react-native";

export type Dog = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  dogId: string;
  status: BookingStatus;
  scheduledAt: string;
  shelterName?: string;
};

export type WalkRecord = {
  id: string;
  dogId: string;
  displayName?: string;
  displayDistance?: string;
  displayDate?: string;
  startedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  shelterName?: string;
};
