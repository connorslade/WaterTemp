use rand::Rng;

pub fn get_temperature() -> u8{
    // This RNG stuff is all temporary
    let mut rng = rand::thread_rng();
    let number: u8 = rng.gen_range(0, 10);
    return number;
}