// Compile and run: rustc concurrency_test.rs -o concurrency_test && ./concurrency_test

mod solution {
    use std::sync::{Arc, Mutex, mpsc};
    use std::thread;

    pub fn parallel_sum(n: u32) -> i32 {
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

    pub fn parallel_double(items: Vec<i32>) -> Vec<i32> {
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
        drop(tx);
        for h in handles {
            h.join().unwrap();
        }
        rx.iter().collect()
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

    // parallel_sum: 0+1+2+3+4 = 10
    check!("parallel_sum(5) = 10", solution::parallel_sum(5) == 10);
    // 0 threads: identity is 0
    check!("parallel_sum(0) = 0", solution::parallel_sum(0) == 0);
    // 1 thread: only index 0 -> 0
    check!("parallel_sum(1) = 0", solution::parallel_sum(1) == 0);
    // 0+1+...+9 = 45
    check!("parallel_sum(10) = 45", solution::parallel_sum(10) == 45);

    // parallel_double
    let mut r1 = solution::parallel_double(vec![1, 2, 3, 4]);
    r1.sort();
    check!("parallel_double [1,2,3,4]", r1 == vec![2, 4, 6, 8]);

    let r2 = solution::parallel_double(vec![]);
    check!("parallel_double empty", r2.is_empty());

    let mut r3 = solution::parallel_double(vec![0, -1, 5]);
    r3.sort();
    check!("parallel_double [0,-1,5]", r3 == vec![-2, 0, 10]);

    let mut r4 = solution::parallel_double(vec![100]);
    r4.sort();
    check!("parallel_double single element", r4 == vec![200]);

    println!("\n{} passed, {} failed", passed, failed);
    if failed > 0 {
        std::process::exit(1);
    }
}
