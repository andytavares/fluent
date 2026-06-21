use std::sync::{Arc, Mutex, mpsc};
use std::thread;

fn parallel_sum(n: u32) -> i32 {
    let counter = Arc::new(Mutex::new(0i32));
    let handles: Vec<_> = (0..n)
        .map(|i| {
            let c = Arc::clone(&counter);
            thread::spawn(move || {
                let mut num = c.lock().unwrap();
                *num += i as i32;
            })
        })
        .collect();

    for h in handles {
        h.join().unwrap();
    }

    *counter.lock().unwrap()
}

fn parallel_double(items: Vec<i32>) -> Vec<i32> {
    let (tx, rx) = mpsc::channel();
    let handles: Vec<_> = items
        .into_iter()
        .map(|item| {
            let tx = tx.clone();
            thread::spawn(move || {
                tx.send(item * 2).unwrap();
            })
        })
        .collect();

    // Drop the original tx so the channel closes after all senders finish.
    drop(tx);

    for h in handles {
        h.join().unwrap();
    }

    rx.iter().collect()
}

fn main() {
    println!("parallel_sum(5) = {}", parallel_sum(5));
    let mut results = parallel_double(vec![1, 2, 3, 4]);
    results.sort();
    println!("parallel_double = {:?}", results);
}
