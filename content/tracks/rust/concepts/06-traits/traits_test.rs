// Compile and run: rustc traits_test.rs -o traits_test && ./traits_test

mod solution {
    pub trait Area {
        fn area(&self) -> f64;

        fn describe(&self) -> String {
            format!("shape with area {:.2}", self.area())
        }
    }

    pub struct Circle {
        pub radius: f64,
    }

    pub struct Triangle {
        pub base: f64,
        pub height: f64,
    }

    impl Area for Circle {
        fn area(&self) -> f64 {
            std::f64::consts::PI * self.radius * self.radius
        }
    }

    impl Area for Triangle {
        fn area(&self) -> f64 {
            0.5 * self.base * self.height
        }
    }

    pub fn print_area(shape: &impl Area) -> String {
        shape.describe()
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

    use solution::{Circle, Triangle};

    // Circle area
    let c = Circle { radius: 1.0 };
    check!("circle r=1 area ≈ π", (c.area() - std::f64::consts::PI).abs() < 1e-9);

    let c2 = Circle { radius: 0.0 };
    check!("circle r=0 area = 0", (c2.area() - 0.0).abs() < 1e-9);

    let c3 = Circle { radius: 2.0 };
    check!("circle r=2 area ≈ 4π", (c3.area() - 4.0 * std::f64::consts::PI).abs() < 1e-9);

    // Triangle area
    let t = Triangle { base: 6.0, height: 4.0 };
    check!("triangle 6x4 area = 12", (t.area() - 12.0).abs() < 1e-9);

    let t2 = Triangle { base: 0.0, height: 10.0 };
    check!("triangle 0x10 area = 0", (t2.area() - 0.0).abs() < 1e-9);

    // describe default impl — format "shape with area X.XX"
    let c4 = Circle { radius: 3.0 };
    let desc = solution::print_area(&c4);
    let expected_area = std::f64::consts::PI * 9.0;
    let expected = format!("shape with area {:.2}", expected_area);
    check!("describe circle r=3", desc == expected);

    let t3 = Triangle { base: 10.0, height: 2.0 };
    let desc2 = solution::print_area(&t3);
    check!("describe triangle 10x2", desc2 == "shape with area 10.00");

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
