export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export enum StatusCode {
  OK       = 200,
  Created  = 201,
  NotFound = 404,
}

export enum Color {
  Red   = "RED",
  Green = "GREEN",
  Blue  = "BLUE",
}

// directionLabel returns a human-readable label for a Direction.
export function directionLabel(d: Direction): string {
  // TODO
  return "";
}

// isValidDirection returns true if value corresponds to a valid Direction.
// Hint: use reverse mapping on the Direction enum object.
export function isValidDirection(value: number): boolean {
  // TODO
  return false;
}

// statusMessage returns the HTTP status message for a StatusCode.
export function statusMessage(code: StatusCode): string {
  // TODO
  return "";
}

// colorToHex returns the hex color string for a Color.
export function colorToHex(c: Color): string {
  // TODO
  return "";
}
