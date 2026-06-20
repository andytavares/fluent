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

export function directionLabel(d: Direction): string {
  switch (d) {
    case Direction.Up:    return "Up";
    case Direction.Down:  return "Down";
    case Direction.Left:  return "Left";
    case Direction.Right: return "Right";
  }
}

export function isValidDirection(value: number): boolean {
  return Direction[value] !== undefined;
}

export function statusMessage(code: StatusCode): string {
  switch (code) {
    case StatusCode.OK:       return "OK";
    case StatusCode.Created:  return "Created";
    case StatusCode.NotFound: return "Not Found";
  }
}

export function colorToHex(c: Color): string {
  switch (c) {
    case Color.Red:   return "#ff0000";
    case Color.Green: return "#00ff00";
    case Color.Blue:  return "#0000ff";
  }
}
