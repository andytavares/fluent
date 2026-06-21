// Compile and run: rustc structs_and_enums_test.rs -o structs_and_enums_test && ./structs_and_enums_test

mod solution {
    pub struct Rectangle {
        pub width: f64,
        pub height: f64,
    }

    impl Rectangle {
        pub fn new(width: f64, height: f64) -> Self {
            Self { width, height }
        }

        pub fn area(&self) -> f64 {
            self.width * self.height
        }

        pub fn is_square(&self) -> bool {
            self.width == self.height
        }
    }

    pub enum Shape {
        Circle(f64),
        Rect(Rectangle),
    }

    pub fn shape_area(shape: &Shape) -> f64 {
        match shape {
            Shape::Circle(r) => std::f64::consts::PI * r * r,
            Shape::Rect(rect) => rect.area(),
        }
    }
}

fn main() {
    let mut passed = 0u32;
    let mut failed = 0u32;

    macro_rules! check {
        ($name:expr, $cond:expr) => {
            if $cond {
                println!("  PASS: {}", $name);
                passed += 1;
            } else {
                println!("  FAIL: {}", $name);
                failed += 1;
            }
        };
    }

    // Rectangle::new and area
    let r = solution::Rectangle::new(4.0, 5.0);
    check!("Rectangle area 4x5", (r.area() - 20.0).abs() < 1e-9);

    let r2 = solution::Rectangle::new(0.0, 10.0);
    check!("Rectangle area 0x10", (r2.area() - 0.0).abs() < 1e-9);

    // is_square
    let sq = solution::Rectangle::new(3.0, 3.0);
    check!("3x3 is square", sq.is_square());

    let non_sq = solution::Rectangle::new(3.0, 4.0);
    check!("3x4 is not square", !non_sq.is_square());

    // shape_area — Circle
    let c = solution::Shape::Circle(1.0);
    check!("circle r=1 area ≈ π", (solution::shape_area(&c) - std::f64::consts::PI).abs() < 1e-9);

    let c2 = solution::Shape::Circle(0.0);
    check!("circle r=0 area = 0", (solution::shape_area(&c2) - 0.0).abs() < 1e-9);

    // shape_area — Rect
    let rect = solution::Shape::Rect(solution::Rectangle::new(3.0, 4.0));
    check!("rect shape area 3x4 = 12", (solution::shape_area(&rect) - 12.0).abs() < 1e-9);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
