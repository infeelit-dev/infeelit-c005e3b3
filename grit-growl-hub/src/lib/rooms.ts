export type RoomCode = "GOLDEN_LION" | "CRYSTAL_BAR";

export const ROOM_LABELS: Record<RoomCode, string> = {
  GOLDEN_LION: "Golden Lion",
  CRYSTAL_BAR: "Crystal Bar",
};

export function isRoomCode(value: string | null | undefined): value is RoomCode {
  return value === "GOLDEN_LION" || value === "CRYSTAL_BAR";
}

export function roomDisplayName(room: string | null | undefined): string {
  if (isRoomCode(room)) return ROOM_LABELS[room];
  return "the room";
}
