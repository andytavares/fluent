class Stack {
  #items = [];

  push(value) {
    this.#items.push(value);
  }

  pop() {
    if (this.#items.length === 0) throw new Error("Stack is empty");
    return this.#items.pop();
  }

  peek() {
    if (this.#items.length === 0) throw new Error("Stack is empty");
    return this.#items[this.#items.length - 1];
  }

  get size() {
    return this.#items.length;
  }

  get isEmpty() {
    return this.#items.length === 0;
  }
}

class Shape {
  constructor(color) {
    this.color = color;
  }

  describe() {
    return `A ${this.color} shape`;
  }
}

class Circle extends Shape {
  constructor(color, radius) {
    super(color);
    this.radius = radius;
  }

  describe() {
    return `A ${this.color} circle with radius ${this.radius}`;
  }

  static unitCircle() {
    return new Circle("white", 1);
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color);
    this.width = width;
    this.height = height;
  }

  describe() {
    return `A ${this.color} rectangle ${this.width}x${this.height}`;
  }

  area() {
    return this.width * this.height;
  }
}

module.exports = { Stack, Shape, Circle, Rectangle };
