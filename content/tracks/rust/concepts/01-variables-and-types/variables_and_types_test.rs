// Compile and run: rustc variables_and_types_test.rs -o variables_and_types_test && ./variables_and_types_test
// Copy your solution functions below inside `mod solution`.

mod solution {
    pub const LANGUAGE: &str = "Rust";

    pub fn sum_array(arr: [i32; 5]) -> i32 {
        arr.iter().sum()
    }

    pub fn min_max(a: i32, b: i32) -> (i32, i32) {
        if a <= b { (a, b) } else { (b, a) }
    }

    pub fn rectangle_area(width: f64, height: f64) -> f64 {
        width * height
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

    // LANGUAGE constant
    check!("LANGUAGE is 'Rust'", solution::LANGUAGE == "Rust");

    // sum_array
    check!("sum_array [1,2,3,4,5]", solution::sum_array([1, 2, 3, 4, 5]) == 15);
    check!("sum_array all zeros", solution::sum_array([0, 0, 0, 0, 0]) == 0);
    check!("sum_array negatives", solution::sum_array([-1, -2, -3, -4, -5]) == -15);
    check!("sum_array mixed", solution::sum_array([10, -3, 0, 7, 1]) == 15);

    // min_max
    check!("min_max(3, 7) -> (3, 7)", solution::min_max(3, 7) == (3, 7));
    check!("min_max(9, 2) -> (2, 9)", solution::min_max(9, 2) == (2, 9));
    check!("min_max equal", solution::min_max(5, 5) == (5, 5));
    check!("min_max negatives", solution::min_max(-4, -10) == (-10, -4));

    // rectangle_area
    check!("area 4.0 x 5.5", (solution::rectangle_area(4.0, 5.5) - 22.0).abs() < 1e-9);
    check!("area 0.0 x 10.0", (solution::rectangle_area(0.0, 10.0) - 0.0).abs() < 1e-9);
    check!("area 3.0 x 3.0", (solution::rectangle_area(3.0, 3.0) - 9.0).abs() < 1e-9);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
