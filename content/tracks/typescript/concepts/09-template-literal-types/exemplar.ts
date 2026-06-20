export type CssProp = "margin" | "padding" | "border";
export type Side = "top" | "bottom" | "left" | "right";
export type CssProperty = `${CssProp}-${Side}`;

export type Entity = "user" | "post" | "comment";
export type EventAction = "created" | "updated" | "deleted";

export function formatEvent<E extends Entity, A extends EventAction>(
  entity: E,
  action: A
): `${E}:${A}` {
  return `${entity}:${action}` as `${E}:${A}`;
}

export function toCssProperty<P extends CssProp, S extends Side>(
  prop: P,
  side: S
): `${P}-${S}` {
  return `${prop}-${side}` as `${P}-${S}`;
}

export function capitalize<S extends string>(s: S): Capitalize<S> {
  if (s.length === 0) return s as Capitalize<S>;
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<S>;
}

export function toEventKey<S extends string>(s: S): Uppercase<S> {
  return s.toUpperCase() as Uppercase<S>;
}
