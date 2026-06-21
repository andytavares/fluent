enum Command {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

fn describe_command(cmd: &Command) -> String {
    match cmd {
        Command::Quit => String::from("quit"),
        Command::Move { x, y } => format!("move to ({}, {})", x, y),
        Command::Write(text) => format!("write: {}", text),
        Command::ChangeColor(r, g, b) => format!("color: (#{:02X}{:02X}{:02X})", r, g, b),
    }
}

fn clamp_option(n: i32) -> Option<i32> {
    match n {
        1..=100 => Some(n),
        _ => None,
    }
}

fn double_or_minus_one(opt: Option<i32>) -> i32 {
    match opt {
        Some(n) => n * 2,
        None => -1,
    }
}

fn main() {
    println!("{}", describe_command(&Command::Quit));
    println!("{}", describe_command(&Command::Move { x: 3, y: -1 }));
    println!("{}", describe_command(&Command::Write(String::from("hi"))));
    println!("{}", describe_command(&Command::ChangeColor(255, 128, 0)));
    println!("{:?}", clamp_option(50));
    println!("{:?}", clamp_option(0));
    println!("{}", double_or_minus_one(Some(7)));
    println!("{}", double_or_minus_one(None));
}
