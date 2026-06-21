fn first(slice: &[i32]) -> i32 {
    // TODO: return the first element, or 0 if empty
    todo!()
}

fn append(s: &mut String, suffix: &str) {
    // TODO: push suffix onto s
    todo!()
}

fn str_len(s: &str) -> usize {
    // TODO: return s.len()
    todo!()
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
