trait Area {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        // TODO: return format!("shape with area {:.2}", self.area())
        todo!()
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
        // TODO: return π * r²
        todo!()
    }
}

impl Area for Triangle {
    fn area(&self) -> f64 {
        // TODO: return 0.5 * base * height
        todo!()
    }
}

fn print_area(shape: &impl Area) -> String {
    // TODO: return shape.describe()
    todo!()
}

fn main() {
    let c = Circle { radius: 3.0 };
    let t = Triangle { base: 6.0, height: 4.0 };
    println!("{}", print_area(&c));
    println!("{}", print_area(&t));
}
