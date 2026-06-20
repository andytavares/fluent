export type CssProp = "margin" | "padding" | "border";
export type Side = "top" | "bottom" | "left" | "right";
export type CssProperty = `${CssProp}-${Side}`;

export type Entity = "user" | "post" | "comment";
export type EventAction = "created" | "updated" | "deleted";

// formatEvent returns "<entity>:<action>" as a template literal type.
export function formatEvent<E extends Entity, A extends EventAction>(
  entity: E,
  action: A
): `${E}:${A}` {
  // TODO
  return "" as any;
}

// toCssProperty returns "<prop>-<side>" as a template literal type.
export function toCssProperty<P extends CssProp, S extends Side>(
  prop: P,
  side: S
): `${P}-${S}` {
  // TODO
  return "" as any;
}

// capitalize returns the string with its first character uppercased.
export function capitalize<S extends string>(s: S): Capitalize<S> {
  // TODO
  return "" as any;
}

// toEventKey uppercases the entire string.
export function toEventKey<S extends string>(s: S): Uppercase<S> {
  // TODO
  return "" as any;
}
