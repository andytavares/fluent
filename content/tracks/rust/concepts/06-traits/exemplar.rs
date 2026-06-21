trait Area {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("shape with area {:.2}", self.area())
    }
}

struct Circle {
    pub radius: f64,
}

struct Triangle {
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

fn print_area(shape: &impl Area) -> String {
    shape.describe()
}

fn main() {
    let c = Circle { radius: 3.0 };
    let t = Triangle { base: 6.0, height: 4.0 };
    println!("{}", print_area(&c));
    println!("{}", print_area(&t));
}
