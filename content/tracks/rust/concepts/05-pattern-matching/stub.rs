enum Command {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

fn describe_command(cmd: &Command) -> String {
    // TODO: match all variants and return the appropriate string
    todo!()
}

fn clamp_option(n: i32) -> Option<i32> {
    // TODO: return Some(n) if 1 <= n <= 100, else None
    todo!()
}

fn double_or_minus_one(opt: Option<i32>) -> i32 {
    // TODO: return value * 2 if Some, or -1 if None
    todo!()
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
