import WalkScreen from "./WalkScreen";

export type WalkActiveScreenState =
  | "paused"
  | "markerSelected"
  | "report";

export function WalkActiveScreen({
  state,
}: {
  state: WalkActiveScreenState;
}) {
  const initialState =
    state === "paused"
      ? "paused"
      : state === "markerSelected"
        ? "plusMenu"
        : state === "report"
          ? "report"
          : "active";

  return <WalkScreen initialState={initialState} />;
}
