// Compile and run: rustc generics_and_lifetimes_test.rs -o generics_and_lifetimes_test && ./generics_and_lifetimes_test

mod solution {
    pub fn first_element<T: Clone>(slice: &[T]) -> Option<T> {
        slice.first().cloned()
    }

    pub fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
        if b.len() > a.len() { b } else { a }
    }

    pub struct Stack<T> {
        items: Vec<T>,
    }

    impl<T> Stack<T> {
        pub fn new() -> Self {
            Self { items: Vec::new() }
        }

        pub fn push(&mut self, item: T) {
            self.items.push(item);
        }

        pub fn pop(&mut self) -> Option<T> {
            self.items.pop()
        }

        pub fn peek(&self) -> Option<&T> {
            self.items.last()
        }

        pub fn is_empty(&self) -> bool {
            self.items.is_empty()
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

    // first_element
    check!("first of [1,2,3]", solution::first_element(&[1i32, 2, 3]) == Some(1));
    check!("first of empty i32", solution::first_element::<i32>(&[]) == None);
    check!("first of [\"a\",\"b\"]", solution::first_element(&["a", "b"]) == Some("a"));
    check!("first of single element", solution::first_element(&[42i32]) == Some(42));

    // longer
    check!("longer('hello','hi') = 'hello'", solution::longer("hello", "hi") == "hello");
    check!("longer('hi','hello') = 'hello'", solution::longer("hi", "hello") == "hello");
    check!("longer equal len returns first", solution::longer("abc", "xyz") == "abc");
    check!("longer('','a') = 'a'", solution::longer("", "a") == "a");

    // Stack
    let mut s: solution::Stack<i32> = solution::Stack::new();
    check!("new stack is empty", s.is_empty());
    check!("peek on empty is None", s.peek() == None);
    check!("pop on empty is None", s.pop() == None);

    s.push(10);
    check!("not empty after push", !s.is_empty());
    check!("peek after push(10) = 10", s.peek() == Some(&10));

    s.push(20);
    check!("peek after push(20) = 20", s.peek() == Some(&20));

    check!("pop = 20 (LIFO)", s.pop() == Some(20));
    check!("pop = 10", s.pop() == Some(10));
    check!("empty after all pops", s.is_empty());

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
