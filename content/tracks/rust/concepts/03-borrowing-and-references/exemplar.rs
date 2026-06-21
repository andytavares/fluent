fn first(slice: &[i32]) -> i32 {
    slice.first().copied().unwrap_or(0)
}

fn append(s: &mut String, suffix: &str) {
    s.push_str(suffix);
}

fn str_len(s: &str) -> usize {
    s.len()
}

fn main() {
    let nums = vec![10, 20, 30];
    println!("first = {}", first(&nums));
    println!("first empty = {}", first(&[]));

    let mut greeting = String::from("hello");
    append(&mut greeting, " world");
    println!("append = {}", greeting);

    println!("str_len = {}", str_len("Rust"));
}
