fn even_squares(nums: &[i32]) -> Vec<i32> {
    // TODO: filter evens, square them, collect
    todo!()
}

fn product(nums: &[i32]) -> i32 {
    // TODO: fold to compute product; return 1 for empty
    todo!()
}

fn long_words_upper(words: Vec<String>, min_len: usize) -> Vec<String> {
    // TODO: keep words with len > min_len, uppercase them, collect
    todo!()
}

fn zip_sum(a: &[i32], b: &[i32]) -> Vec<i32> {
    // TODO: zip a and b, sum pairs, collect
    todo!()
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
