use rand::Rng;

pub fn get_temperature() -> i32 {
    // This RNG stuff is all temporary
    let mut rng = rand::thread_rng();
    let number: i32 = rng.gen_range(0, 10);
    return number;
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_temperature_1() {
        let number: i32 = get_temperature();
        assert!(number >= 0 && number < 10);
    }
}