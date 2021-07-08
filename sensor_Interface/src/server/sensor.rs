use rand::Rng;
use std::fs;

fn remove_whitespace(mut value: String) -> String {
    // Remove any leading spaces
    while value.starts_with(' ') {
        value = value[1..value.len()].to_string();
    }

    // Remove any trailing spaces
    while value.ends_with(' ') {
        value = value[..value.len() - 1].to_string();
    }
    value
}

/// Get current temperature from sensor
pub fn get_temperature(dev_id: &String, debug: bool) -> i32 {
    if debug {
        let mut rng = rand::thread_rng();
        return rng.gen_range(0, 10);
    }
    let mut dev_path = format!("/sys/bus/w1/devices/{}/{}", dev_id, "w1_slave");
    let mut sensor_data = fs::read_to_string(&mut dev_path).expect("Failed to read sensor data");
    while &remove_whitespace(sensor_data[sensor_data.len() - 3..sensor_data.len()].to_string()) != "YES" {
        sensor_data = fs::read_to_string(&mut dev_path).expect("Failed to read sensor data");
        println!("Checking: '{}'", remove_whitespace(sensor_data[sensor_data.len() - 3..sensor_data.len()].to_string()));
        println!("tmpData: {}", &sensor_data);
    }
    print!("{}", sensor_data);
    1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_temperature_1() {
        let number: i32 = get_temperature(&"".to_string(), true);
        assert!(number >= 0 && number < 10);
    }
}
