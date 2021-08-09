use super::common;
use rand::Rng;
use std::fmt;
use std::fs;

/// Some errors that can occur
pub enum ErrorType {
    /// The sensor is not found.
    SensorNotFound,

    /// There was an error parsings the sensor data.
    DataParseError,
}

/// Defines a sensor.
///
/// A sensor contains a Device ID, a Friendly Name and a calibration factor.
pub struct Sensor {
    pub id: String,
    pub name: String,
    pub calibration: Option<f64>,
    pub debug: bool,
}

/// All the info sent bu the system about a sensor.
///
/// This info will be send for each sensor when /temp is requested.
pub struct Value {
    pub id: String,
    pub name: String,
    pub value: f64,
}

/// Implementation of a sensor.
impl Sensor {
    /// Creates a new sensor.
    /// ## Example
    /// ```rust
    /// let sensor = Sensor::new("00000bdf4372", "Water", None, false);
    /// ```
    pub fn new(id: &str, name: &str, calibration: Option<f64>, debug: bool) -> Sensor {
        Sensor {
            id: id.to_string(),
            name: name.to_string(),
            calibration,
            debug,
        }
    }

    /// Get the current temperature of a sensor.
    /// ## Example
    /// ```rust
    /// let sensor = Sensor::new("00000bdf4372", "Water", None, false);
    /// sensor.get_temperature();
    /// ```
    pub fn get_temperature(&self) -> Result<f64, ErrorType> {
        let cal = self.calibration.unwrap_or(0.0);

        if self.debug {
            let mut rng = rand::thread_rng();
            return Ok(rng.gen_range::<f64>(0.0, 10.0) + cal);
        }

        let sensor_data = match get_sensor_data(&self.id[..]) {
            Ok(data) => data,
            Err(e) => return Err(e),
        };
        let temp: Vec<&str> = sensor_data.split("t=").collect();
        if temp.len() != 2 {
            color_print!(common::Color::Red, "Error: {}", &sensor_data);
            return Err(ErrorType::DataParseError);
        }
        let temp_str = temp[1].to_string();
        let temp_c = temp_str
            .parse::<f64>()
            .expect("Failed to parse temperature")
            / 1000.0;
        let temp_f = temp_c * 9.0 / 5.0 + 32.0;
        Ok(temp_f + cal)
    }

    /// Clone a sensor.
    pub fn clone(&self) -> Sensor {
        Sensor {
            id: self.id.clone(),
            name: self.name.clone(),
            calibration: self.calibration,
            debug: self.debug,
        }
    }
}

#[allow(unused_must_use)]
/// Allow getting debug printout of a sensor Struct
impl fmt::Debug for Sensor {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Sensor(id={}, name={}, calibration={}, debug={})",
            self.id,
            self.name,
            self.calibration.unwrap_or(0.0),
            self.debug
        );
        Ok(())
    }
}

/// Implementations for Value.
impl Value {
    pub fn new(id: &str, name: &str, value: f64) -> Value {
        Value {
            id: id.to_string(),
            name: name.to_string(),
            value,
        }
    }
}

/// Get rew sensor data
///
/// **Not in a useable format yet**
fn get_sensor_data(dev_id: &str) -> Result<String, ErrorType> {
    let mut dev_path = format!("/sys/bus/w1/devices/{}/w1_slave", dev_id);
    let sensor_data: String = match fs::read_to_string(&mut dev_path) {
        Ok(v) => v,
        Err(_) => {
            // Prints a \r before each error because if this error is triggered
            // it will probably be triggered again... and again...
            print!(
                "\r{} {}",
                common::color("[-] Error reading sensor data for", common::Color::Red),
                common::color(dev_id, common::Color::Cyan)
            );
            return Err(ErrorType::SensorNotFound);
        }
    };
    let sensor_data_lines: Vec<&str> = sensor_data.split('\n').collect();
    if &common::remove_whitespace(
        sensor_data_lines[0][sensor_data_lines[0].len() - 3..sensor_data_lines[0].len()]
            .to_string(),
    ) != "YES"
    {
        return get_sensor_data(dev_id);
    }
    Ok(sensor_data_lines[1].to_string())
}

/// Get sensor data for all sensors
/// ## Example
/// ```rust
/// let sensors: Vec<sensor::Sensor> = sensor::get_sensors(&cfg.data, debug);
/// sensors.get_all_temp();
/// ```
pub fn get_all_temp(sensors: &[Sensor]) -> Vec<Value> {
    let mut values: Vec<Value> = Vec::new();

    for i in sensors.iter() {
        values.push(Value::new(
            &i.id,
            &i.name,
            i.get_temperature().ok().unwrap(),
        ));
    }
    values
}

/// Get data history from disk
/// ## Example
/// ```rust
/// sensor::get_history("sensor.wtl");
/// ```
pub fn get_history(log_file: &str) -> Option<String> {
    match fs::read_to_string(log_file) {
        Ok(data) => Some(data),
        Err(_) => None,
    }
}

/// Get all the sensors defined in the config file
///
/// Returns a vector of sensors
/// ## Example
/// ```rust
/// let sensors: Vec<sensor::Sensor> = sensor::get_sensors(&cfg.data, debug);
/// ```
pub fn get_sensors(data: &[[String; 2]], debug: bool) -> Vec<Sensor> {
    let mut sensors: Vec<Sensor> = Vec::new();
    for i in data.iter() {
        if i[0].contains("sensor_") {
            let friendly_name =
                common::remove_whitespace(i[0].split('_').collect::<Vec<&str>>()[1].to_string());
            let sensor_id =
                common::remove_whitespace(i[1].split(',').collect::<Vec<&str>>()[0].to_string());
            let calibration =
                common::remove_whitespace(i[1].split(',').collect::<Vec<&str>>()[1].to_string());

            sensors.push(Sensor::new(
                &sensor_id[..],
                &friendly_name[..],
                Some(calibration.parse::<f64>().unwrap()),
                debug,
            ));
        }
    }
    sensors
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    /// Test Getting Data from a Sensor
    fn test_get_temperature_1() {
        let sensor = Sensor::new("", "Water", None, true);
        let number: f64 = sensor.get_temperature().ok().unwrap();
        assert!(number >= 0.0 && number < 10.0);
    }

    #[test]
    /// Test Getting Data from a Sensor with Calibration
    fn test_get_temperature_cal() {
        let sensor = Sensor::new("", "Water", Some(10.0), true);
        let number: f64 = sensor.get_temperature().ok().unwrap();
        assert!(number >= 10.0 && number < 20.0);
    }

    #[test]
    /// Test loading sensors from config file
    fn test_get_sensors() {
        let data = vec![
            ["sensor_nose".to_string(), "1234,0.0".to_string()],
            ["sensor_water".to_string(), "4321,12.7".to_string()],
        ];
        let sensors = get_sensors(&data, true);
        assert_eq!(sensors.len(), 2);

        assert_eq!(sensors[0].id, "1234");
        assert_eq!(sensors[0].name, "nose");
        assert_eq!(sensors[0].calibration.unwrap(), 0.0);

        assert_eq!(sensors[1].id, "4321");
        assert_eq!(sensors[1].name, "water");
        assert_eq!(sensors[1].calibration.unwrap(), 12.7);
    }

    #[test]
    /// Test Getting all the temperature data
    fn test_get_all_temp() {
        let data = vec![
            ["sensor_nose".to_string(), "1234,0.0".to_string()],
            ["sensor_water".to_string(), "4321,12.7".to_string()],
        ];
        let sensors = get_sensors(&data, true);
        let values = get_all_temp(&sensors);

        assert_eq!(values.len(), 2);
        assert_eq!(values[0].id, "1234");
        assert_eq!(values[0].name, "nose");
        assert!(values[0].value >= 0.0 && values[0].value <= 10.0);

        assert_eq!(values[1].id, "4321");
        assert_eq!(values[1].name, "water");
        assert!(values[1].value >= 12.7 && values[1].value <= 22.7);
    }
}
