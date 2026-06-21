use std::fmt;

#[derive(Debug, PartialEq)]
enum ParseError {
    Empty,
    InvalidNumber(String),
    OutOfRange(i32),
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ParseError::Empty => write!(f, "input is empty"),
            ParseError::InvalidNumber(s) => write!(f, "invalid number: {}", s),
            ParseError::OutOfRange(n) => write!(f, "number out of range: {}", n),
        }
    }
}

fn parse_score(s: &str) -> Result<i32, ParseError> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return Err(ParseError::Empty);
    }
    let n: i32 = trimmed
        .parse()
        .map_err(|_| ParseError::InvalidNumber(trimmed.to_string()))?;
    if n < 0 || n > 1000 {
        return Err(ParseError::OutOfRange(n));
    }
    Ok(n)
}

fn sum_scores(inputs: &[&str]) -> i32 {
    inputs.iter().filter_map(|s| parse_score(s).ok()).sum()
}

fn main() {
    println!("{:?}", parse_score("42"));
    println!("{:?}", parse_score("  "));
    println!("{:?}", parse_score("abc"));
    println!("{:?}", parse_score("-1"));
    println!("{:?}", parse_score("1001"));
    println!("sum = {}", sum_scores(&["10", "bad", "30", "", "60"]));
}
