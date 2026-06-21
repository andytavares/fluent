const LANGUAGE: &str = "Rust";

fn sum_array(arr: [i32; 5]) -> i32 {
    arr.iter().sum()
}

fn min_max(a: i32, b: i32) -> (i32, i32) {
    if a <= b { (a, b) } else { (b, a) }
}

fn rectangle_area(width: f64, height: f64) -> f64 {
    width * height
}

fn main() {
    println!("LANGUAGE = {}", LANGUAGE);
    println!("sum_array = {}", sum_array([1, 2, 3, 4, 5]));
    println!("min_max = {:?}", min_max(10, 3));
    println!("rectangle_area = {}", rectangle_area(4.0, 5.5));
}
