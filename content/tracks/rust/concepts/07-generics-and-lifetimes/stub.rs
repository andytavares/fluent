fn first_element<T: Clone>(slice: &[T]) -> Option<T> {
    // TODO: return Some(clone of first element) or None
    todo!()
}

fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    // TODO: return the longer string; if equal, return a
    todo!()
}

struct Stack<T> {
    // TODO: add a Vec<T> field
}

impl<T> Stack<T> {
    fn new() -> Self {
        // TODO
        todo!()
    }

    fn push(&mut self, item: T) {
        // TODO
        todo!()
    }

    fn pop(&mut self) -> Option<T> {
        // TODO
        todo!()
    }

    fn peek(&self) -> Option<&T> {
        // TODO
        todo!()
    }

    fn is_empty(&self) -> bool {
        // TODO
        todo!()
    }
}

fn main() {
    println!("{:?}", first_element(&[1, 2, 3]));
    println!("{:?}", first_element::<i32>(&[]));
    println!("{}", longer("hello", "hi"));

    let mut s: Stack<i32> = Stack::new();
    s.push(1);
    s.push(2);
    println!("peek = {:?}", s.peek());
    println!("pop = {:?}", s.pop());
    println!("is_empty = {}", s.is_empty());
}
