use std::fmt;

#[derive(Debug, PartialEq)]
enum ParseError {
    Empty,
    InvalidNumber(String),
    OutOfRange(i32),
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // TODO: write a human-readable message for each variant
        todo!()
    }
}

fn parse_score(s: &str) -> Result<i32, ParseError> {
    // TODO: trim, check empty, parse i32, check range 0..=1000
    todo!()
}

fn sum_scores(inputs: &[&str]) -> i32 {
    // TODO: sum all Ok values from parse_score, ignoring errors
    todo!()
}

fn main() {
    println!("{:?}", parse_score("42"));
    println!("{:?}", parse_score("  "));
    println!("{:?}", parse_score("abc"));
    println!("{:?}", parse_score("-1"));
    println!("{:?}", parse_score("1001"));
    println!("sum = {}", sum_scores(&["10", "bad", "30", "", "60"]));
}
