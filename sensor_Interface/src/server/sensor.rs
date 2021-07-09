use super::super::common;
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

fn get_sensor_data(dev_id: &String) -> String {
    let mut dev_path = format!("/sys/bus/w1/devices/{}/{}", dev_id, "w1_slave");
    let sensor_data = fs::read_to_string(&mut dev_path).expect("Failed to read sensor data");
    let sensor_data_lines: Vec<&str> = sensor_data.split('\n').collect();
    if &remove_whitespace(sensor_data_lines[0][sensor_data_lines[0].len() - 3..sensor_data_lines[0].len()].to_string()) != "YES" {
        return get_sensor_data(dev_id);
    }
    return sensor_data_lines[1].to_string();
}

/// Get current temperature from sensor
pub fn get_temperature(dev_id: &String, debug: bool, calibration: Option<f64>) -> f64 {
    let cal = match calibration {
        Some(c) => c,
        None => 0.0,
    };

    if debug {
        let mut rng = rand::thread_rng();
        return rng.gen_range::<f64>(0.0, 10.0) + cal;
    }

    let sensor_data = get_sensor_data(dev_id);
    let temp: Vec<&str> = sensor_data.split("t=").collect();
    if temp.len() != 2 {
        println!("{}", common::color("[-] Error Parsing Sensor Data :/", 31));
        return -1.0;
    }
    let temp_str = temp[1].to_string();
    let temp_c = temp_str.parse::<f64>().expect("Failed to parse temperature") / 1000.0;
    let temp_f = temp_c * 9.0 / 5.0 + 32.0;
    return temp_f + cal;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_temperature_1() {
        let number: f64 = get_temperature(&"".to_string(), true, None);
        assert!(number >= 0.0 && number < 10.0);
    }

    #[test]
    fn test_get_temperature_cal() {
        let number: f64 = get_temperature(&"".to_string(), true, Some(10.0));
        assert!(number >= 10.0 && number < 20.0);
    }
}
