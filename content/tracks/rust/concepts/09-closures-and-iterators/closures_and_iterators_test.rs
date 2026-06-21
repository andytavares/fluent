// Compile and run: rustc closures_and_iterators_test.rs -o closures_and_iterators_test && ./closures_and_iterators_test

mod solution {
    pub fn even_squares(nums: &[i32]) -> Vec<i32> {
        nums.iter()
            .filter(|&&n| n % 2 == 0)
            .map(|&n| n * n)
            .collect()
    }

    pub fn product(nums: &[i32]) -> i32 {
        nums.iter().fold(1, |acc, &x| acc * x)
    }

    pub fn long_words_upper(words: Vec<String>, min_len: usize) -> Vec<String> {
        words.into_iter()
            .filter(|w| w.len() > min_len)
            .map(|w| w.to_uppercase())
            .collect()
    }

    pub fn zip_sum(a: &[i32], b: &[i32]) -> Vec<i32> {
        a.iter().zip(b.iter()).map(|(&x, &y)| x + y).collect()
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

    // even_squares
    check!("even_squares [1..6]", solution::even_squares(&[1, 2, 3, 4, 5, 6]) == vec![4, 16, 36]);
    check!("even_squares all odd", solution::even_squares(&[1, 3, 5]) == vec![]);
    check!("even_squares empty", solution::even_squares(&[]) == vec![]);
    check!("even_squares [2]", solution::even_squares(&[2]) == vec![4]);

    // product
    check!("product [1,2,3,4,5] = 120", solution::product(&[1, 2, 3, 4, 5]) == 120);
    check!("product [] = 1", solution::product(&[]) == 1);
    check!("product [7] = 7", solution::product(&[7]) == 7);
    check!("product with zero = 0", solution::product(&[3, 0, 7]) == 0);

    // long_words_upper
    let words = vec![
        String::from("hi"),
        String::from("hello"),
        String::from("rust"),
        String::from("a"),
    ];
    let result = solution::long_words_upper(words, 3);
    check!("long_words_upper min_len=3", result == vec!["HELLO", "RUST"]);

    let empty: Vec<String> = solution::long_words_upper(vec![], 2);
    check!("long_words_upper empty input", empty.is_empty());

    let none_pass = solution::long_words_upper(vec![String::from("hi")], 10);
    check!("long_words_upper none pass threshold", none_pass.is_empty());

    // zip_sum
    check!("zip_sum equal length", solution::zip_sum(&[1, 2, 3], &[10, 20, 30]) == vec![11, 22, 33]);
    check!("zip_sum a shorter", solution::zip_sum(&[1, 2], &[10, 20, 30]) == vec![11, 22]);
    check!("zip_sum b shorter", solution::zip_sum(&[1, 2, 3], &[10]) == vec![11]);
    check!("zip_sum both empty", solution::zip_sum(&[], &[]) == vec![]);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
