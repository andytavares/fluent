class Stack {
  #items = [];

  push(value) {
    // TODO
  }

  pop() {
    // TODO
    return undefined;
  }

  peek() {
    // TODO
    return undefined;
  }

  get size() {
    // TODO
    return 0;
  }

  get isEmpty() {
    // TODO
    return true;
  }
}

class Shape {
  constructor(color) {
    this.color = color;
  }

  describe() {
    // TODO
    return "";
  }
}

class Circle extends Shape {
  constructor(color, radius) {
    super(color);
    this.radius = radius;
  }

  describe() {
    // TODO
    return "";
  }

  static unitCircle() {
    // TODO
    return null;
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color);
    this.width = width;
    this.height = height;
  }

  describe() {
    // TODO
    return "";
  }

  area() {
    // TODO
    return 0;
  }
}

module.exports = { Stack, Shape, Circle, Rectangle };

// Quick demo
const s = new Stack();
s.push(1);
s.push(2);
console.log(s.size);     // 2
console.log(s.pop());    // 2

const c = Circle.unitCircle();
console.log(c.describe()); // A white circle with radius 1
