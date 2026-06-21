// Compile and run: rustc ownership_test.rs -o ownership_test && ./ownership_test

mod solution {
    pub fn string_length(s: String) -> usize {
        s.len()
    }

    pub fn append_world(s: String) -> String {
        s + " world"
    }

    pub fn exclaim(s: &String) -> String {
        let mut result = s.clone();
        result.push('!');
        result
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

    // string_length
    check!("length of 'hello'", solution::string_length(String::from("hello")) == 5);
    check!("length of empty string", solution::string_length(String::from("")) == 0);
    check!("length of 'Rust'", solution::string_length(String::from("Rust")) == 4);

    // append_world
    check!("append_world('hello')", solution::append_world(String::from("hello")) == "hello world");
    check!("append_world('')", solution::append_world(String::from("")) == " world");

    // exclaim — the original must remain accessible after the call
    let original = String::from("hey");
    let result = solution::exclaim(&original);
    check!("exclaim returns 'hey!'", result == "hey!");
    check!("exclaim leaves original intact", original == "hey");

    let original2 = String::from("");
    let result2 = solution::exclaim(&original2);
    check!("exclaim on empty string", result2 == "!");
    check!("exclaim empty original intact", original2 == "");

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
