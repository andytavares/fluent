fn even_squares(nums: &[i32]) -> Vec<i32> {
    nums.iter()
        .filter(|&&n| n % 2 == 0)
        .map(|&n| n * n)
        .collect()
}

fn product(nums: &[i32]) -> i32 {
    nums.iter().fold(1, |acc, &x| acc * x)
}

fn long_words_upper(words: Vec<String>, min_len: usize) -> Vec<String> {
    words.into_iter()
        .filter(|w| w.len() > min_len)
        .map(|w| w.to_uppercase())
        .collect()
}

fn zip_sum(a: &[i32], b: &[i32]) -> Vec<i32> {
    a.iter().zip(b.iter()).map(|(&x, &y)| x + y).collect()
}

fn main() {
    println!("{:?}", even_squares(&[1, 2, 3, 4, 5, 6]));
    println!("{}", product(&[1, 2, 3, 4, 5]));
    println!("{}", product(&[]));
    let words = vec![
        String::from("hi"),
        String::from("hello"),
        String::from("rust"),
    ];
    println!("{:?}", long_words_upper(words, 3));
    println!("{:?}", zip_sum(&[1, 2, 3], &[10, 20, 30]));
}
