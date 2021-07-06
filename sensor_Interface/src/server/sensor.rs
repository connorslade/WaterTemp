use rand::Rng;

/// Get current temperature from sensor
pub fn get_temperature() -> i32 {
    // This RNG stuff is all temporary
    let mut rng = rand::thread_rng();
    rng.gen_range(0, 10)
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
