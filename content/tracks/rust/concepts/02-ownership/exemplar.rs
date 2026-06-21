fn string_length(s: String) -> usize {
    s.len()
}

fn append_world(s: String) -> String {
    s + " world"
}

fn exclaim(s: &String) -> String {
    let mut result = s.clone();
    result.push('!');
    result
}

fn main() {
    let msg = String::from("hello");
    println!("length = {}", string_length(msg));

    let base = String::from("hello");
    println!("append = {}", append_world(base));

    let original = String::from("hello");
    println!("exclaim = {}", exclaim(&original));
    println!("original still valid = {}", original);
}
