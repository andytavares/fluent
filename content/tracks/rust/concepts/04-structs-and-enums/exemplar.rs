struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn new(width: f64, height: f64) -> Self {
        Self { width, height }
    }

    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn is_square(&self) -> bool {
        self.width == self.height
    }
}

enum Shape {
    Circle(f64),
    Rect(Rectangle),
}

fn shape_area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rect(rect) => rect.area(),
    }
}

fn main() {
    let r = Rectangle::new(4.0, 5.0);
    println!("area = {}", r.area());
    println!("is_square = {}", r.is_square());

    let sq = Rectangle::new(3.0, 3.0);
    println!("sq is_square = {}", sq.is_square());

    let c = Shape::Circle(2.0);
    println!("circle area = {:.4}", shape_area(&c));

    let rect = Shape::Rect(Rectangle::new(3.0, 4.0));
    println!("rect area = {}", shape_area(&rect));
}
