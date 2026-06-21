struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn new(width: f64, height: f64) -> Self {
        // TODO: construct and return a Rectangle
        todo!()
    }

    fn area(&self) -> f64 {
        // TODO: return width * height
        todo!()
    }

    fn is_square(&self) -> bool {
        // TODO: return true if width == height
        todo!()
    }
}

enum Shape {
    Circle(f64),
    Rect(Rectangle),
}

fn shape_area(shape: &Shape) -> f64 {
    // TODO: match on Shape and return the correct area
    // Circle area = π * r²  (use std::f64::consts::PI)
    todo!()
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
