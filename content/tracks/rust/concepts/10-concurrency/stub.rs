use std::sync::{Arc, Mutex, mpsc};
use std::thread;

fn parallel_sum(n: u32) -> i32 {
    // TODO: spawn n threads, each adding its index (0..n) to Arc<Mutex<i32>>
    // join all handles, then return the final counter value
    todo!()
}

fn parallel_double(items: Vec<i32>) -> Vec<i32> {
    // TODO: spawn one thread per item, each sends item * 2 through mpsc channel
    // collect all received values into a Vec and return it
    todo!()
}

fn main() {
    println!("parallel_sum(5) = {}", parallel_sum(5));  // 0+1+2+3+4 = 10
    let mut results = parallel_double(vec![1, 2, 3, 4]);
    results.sort();
    println!("parallel_double = {:?}", results); // [2, 4, 6, 8]
}
