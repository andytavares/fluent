// Shape is an abstract base class. Subclasses must implement area().
export abstract class Shape {
  // area returns the area of this shape.
  abstract area(): number;

  // describe returns "Area: <n>" rounded to 2 decimal places.
  describe(): string {
    // TODO
    return "";
  }
}

// Circle extends Shape with a private radius.
export class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    // TODO
    return 0;
  }
}

// Rectangle extends Shape with private width and height.
export class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    // TODO
    return 0;
  }
}

// Resizable describes shapes that can be uniformly scaled.
export interface Resizable {
  scale(factor: number): void;
}

// ResizableCircle extends Circle and implements Resizable.
export class ResizableCircle extends Circle implements Resizable {
  private radius: number;

  constructor(radius: number) {
    super(radius);
    this.radius = radius;
  }

  // scale multiplies the radius by factor.
  scale(factor: number): void {
    // TODO
  }

  // getRadius returns the current radius.
  getRadius(): number {
    // TODO
    return 0;
  }
}
