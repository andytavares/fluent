// Compile and run: rustc borrowing_and_references_test.rs -o borrowing_and_references_test && ./borrowing_and_references_test

mod solution {
    pub fn first(slice: &[i32]) -> i32 {
        slice.first().copied().unwrap_or(0)
    }

    pub fn append(s: &mut String, suffix: &str) {
        s.push_str(suffix);
    }

    pub fn str_len(s: &str) -> usize {
        s.len()
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

    // first
    check!("first of [10,20,30]", solution::first(&[10, 20, 30]) == 10);
    check!("first of [5]", solution::first(&[5]) == 5);
    check!("first of empty slice", solution::first(&[]) == 0);
    check!("first of negative", solution::first(&[-7, 1, 2]) == -7);

    // append — verifies mutation through &mut
    let mut s = String::from("hello");
    solution::append(&mut s, " world");
    check!("append ' world'", s == "hello world");

    let mut s2 = String::from("");
    solution::append(&mut s2, "start");
    check!("append to empty string", s2 == "start");

    let mut s3 = String::from("foo");
    solution::append(&mut s3, "");
    check!("append empty suffix", s3 == "foo");

    // str_len — accepts both &String and &str literals
    check!("str_len of 'Rust'", solution::str_len("Rust") == 4);
    check!("str_len of ''", solution::str_len("") == 0);
    let owned = String::from("hello");
    check!("str_len of owned String borrow", solution::str_len(&owned) == 5);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
