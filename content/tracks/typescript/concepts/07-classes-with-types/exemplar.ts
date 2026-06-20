export abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `Area: ${this.area().toFixed(2)}`;
  }
}

export class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

export class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }
}

export interface Resizable {
  scale(factor: number): void;
}

export class ResizableCircle extends Circle implements Resizable {
  private _radius: number;

  constructor(radius: number) {
    super(radius);
    this._radius = radius;
  }

  area(): number {
    return Math.PI * this._radius ** 2;
  }

  scale(factor: number): void {
    this._radius *= factor;
  }

  getRadius(): number {
    return this._radius;
  }
}
