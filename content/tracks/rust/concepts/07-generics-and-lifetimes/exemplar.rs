fn first_element<T: Clone>(slice: &[T]) -> Option<T> {
    slice.first().cloned()
}

fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    if b.len() > a.len() { b } else { a }
}

struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Self { items: Vec::new() }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }

    fn peek(&self) -> Option<&T> {
        self.items.last()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
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
