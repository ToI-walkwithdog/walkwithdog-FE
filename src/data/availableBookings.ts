export type AvailableBooking = {
  dogId: "kongi" | "moka" | "bori";
  size: "소형견" | "중형견";
  shelterName: string;
  district: string;
  maxWalkMinutes: number;
  rating: number;
  schedules: Array<{ date: string; time: string }>;
};

export const availableBookings: AvailableBooking[] = [
  {
    dogId: "kongi",
    size: "소형견",
    shelterName: "행복 보호소",
    district: "서울 성북구",
    maxWalkMinutes: 30,
    rating: 3.5,
    schedules: [
      { date: "11월 12일", time: "13:00~14:00" },
      { date: "11월 13일", time: "10:00~11:00" },
    ],
  },
  {
    dogId: "moka",
    size: "중형견",
    shelterName: "해피 보호소",
    district: "서울 성북구",
    maxWalkMinutes: 40,
    rating: 3.5,
    schedules: [
      { date: "11월 12일", time: "14:00~15:00" },
      { date: "11월 14일", time: "13:00~14:00" },
    ],
  },
  {
    dogId: "bori",
    size: "중형견",
    shelterName: "우와 보호소",
    district: "서울 성북구",
    maxWalkMinutes: 30,
    rating: 3.5,
    schedules: [
      { date: "11월 13일", time: "11:00~12:00" },
      { date: "11월 15일", time: "15:00~16:00" },
    ],
  },
];
