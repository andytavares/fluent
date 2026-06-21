// Compile and run: rustc pattern_matching_test.rs -o pattern_matching_test && ./pattern_matching_test

mod solution {
    pub enum Command {
        Quit,
        Move { x: i32, y: i32 },
        Write(String),
        ChangeColor(u8, u8, u8),
    }

    pub fn describe_command(cmd: &Command) -> String {
        match cmd {
            Command::Quit => String::from("quit"),
            Command::Move { x, y } => format!("move to ({}, {})", x, y),
            Command::Write(text) => format!("write: {}", text),
            Command::ChangeColor(r, g, b) => format!("color: (#{:02X}{:02X}{:02X})", r, g, b),
        }
    }

    pub fn clamp_option(n: i32) -> Option<i32> {
        match n {
            1..=100 => Some(n),
            _ => None,
        }
    }

    pub fn double_or_minus_one(opt: Option<i32>) -> i32 {
        match opt {
            Some(n) => n * 2,
            None => -1,
        }
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

    use solution::Command;

    // describe_command
    check!("Quit", solution::describe_command(&Command::Quit) == "quit");
    check!("Move(3,-1)", solution::describe_command(&Command::Move { x: 3, y: -1 }) == "move to (3, -1)");
    check!("Move(0,0)", solution::describe_command(&Command::Move { x: 0, y: 0 }) == "move to (0, 0)");
    check!("Write hi", solution::describe_command(&Command::Write(String::from("hi"))) == "write: hi");
    check!("Write empty", solution::describe_command(&Command::Write(String::from(""))) == "write: ");
    check!("ChangeColor(255,128,0)", solution::describe_command(&Command::ChangeColor(255, 128, 0)) == "color: (#FF8000)");
    check!("ChangeColor(0,0,0)", solution::describe_command(&Command::ChangeColor(0, 0, 0)) == "color: (#000000)");

    // clamp_option
    check!("clamp 50 -> Some(50)", solution::clamp_option(50) == Some(50));
    check!("clamp 1 -> Some(1)", solution::clamp_option(1) == Some(1));
    check!("clamp 100 -> Some(100)", solution::clamp_option(100) == Some(100));
    check!("clamp 0 -> None", solution::clamp_option(0) == None);
    check!("clamp 101 -> None", solution::clamp_option(101) == None);
    check!("clamp -5 -> None", solution::clamp_option(-5) == None);

    // double_or_minus_one
    check!("double Some(7) -> 14", solution::double_or_minus_one(Some(7)) == 14);
    check!("double Some(0) -> 0", solution::double_or_minus_one(Some(0)) == 0);
    check!("double None -> -1", solution::double_or_minus_one(None) == -1);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
