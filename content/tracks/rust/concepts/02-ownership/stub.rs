fn string_length(s: String) -> usize {
    // TODO: return s.len()
    todo!()
}

fn append_world(s: String) -> String {
    // TODO: append " world" to s and return the new String
    todo!()
}

fn exclaim(s: &String) -> String {
    // TODO: clone s and append "!" — do not consume s
    todo!()
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
