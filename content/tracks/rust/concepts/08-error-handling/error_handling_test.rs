// Compile and run: rustc error_handling_test.rs -o error_handling_test && ./error_handling_test

mod solution {
    use std::fmt;

    #[derive(Debug, PartialEq)]
    pub enum ParseError {
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

    pub fn parse_score(s: &str) -> Result<i32, ParseError> {
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

    pub fn sum_scores(inputs: &[&str]) -> i32 {
        inputs.iter().filter_map(|s| parse_score(s).ok()).sum()
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

    use solution::ParseError;

    // parse_score — Ok cases
    check!("parse '42' -> Ok(42)", solution::parse_score("42") == Ok(42));
    check!("parse '0' -> Ok(0)", solution::parse_score("0") == Ok(0));
    check!("parse '1000' -> Ok(1000)", solution::parse_score("1000") == Ok(1000));
    check!("parse '  7  ' trims whitespace", solution::parse_score("  7  ") == Ok(7));

    // parse_score — Empty
    check!("parse '' -> Empty", solution::parse_score("") == Err(ParseError::Empty));
    check!("parse '  ' -> Empty", solution::parse_score("   ") == Err(ParseError::Empty));

    // parse_score — InvalidNumber
    check!("parse 'abc' -> InvalidNumber", matches!(solution::parse_score("abc"), Err(ParseError::InvalidNumber(_))));
    check!("parse '1.5' -> InvalidNumber", matches!(solution::parse_score("1.5"), Err(ParseError::InvalidNumber(_))));

    // parse_score — OutOfRange
    check!("parse '-1' -> OutOfRange(-1)", solution::parse_score("-1") == Err(ParseError::OutOfRange(-1)));
    check!("parse '1001' -> OutOfRange(1001)", solution::parse_score("1001") == Err(ParseError::OutOfRange(1001)));

    // Display impl — just verify it doesn't panic and produces non-empty output
    let e1 = ParseError::Empty;
    check!("Display Empty non-empty", !format!("{}", e1).is_empty());
    let e2 = ParseError::InvalidNumber(String::from("bad"));
    check!("Display InvalidNumber mentions 'bad'", format!("{}", e2).contains("bad"));
    let e3 = ParseError::OutOfRange(-5);
    check!("Display OutOfRange mentions '-5'", format!("{}", e3).contains("-5"));

    // sum_scores
    check!("sum ['10','bad','30','','60'] = 100", solution::sum_scores(&["10", "bad", "30", "", "60"]) == 100);
    check!("sum [] = 0", solution::sum_scores(&[]) == 0);
    check!("sum all invalid = 0", solution::sum_scores(&["bad", "", "-1"]) == 0);
    check!("sum ['5','10'] = 15", solution::sum_scores(&["5", "10"]) == 15);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
