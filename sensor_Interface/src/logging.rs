use std::time::{Duration, Instant};
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::thread;

use super::server::sensor;

pub fn start_data_logging(log_file: &str, log_interval: u64, debug: bool, dev_id: String, calibration: f64) {
    // Open file
    // Will also create file if it does not exist
    let mut file = OpenOptions::new()
    .write(true)
    .append(true)
    .create(true)
    .open(log_file)
    .expect("Error opening file");

    loop {
        let start = Instant::now();

        let temp: f64 = sensor::get_temperature(&dev_id, debug, Some(calibration));

        println!("[+] TMP: {:?}", temp);
        if let Err(e) = writeln!(file, "{}", temp) {
            eprintln!("Error writhing to file: {}", e);
        }

        // Fancy stuff to make sure this runs every 5 seconds
        // not just 5 seconds after everything finished processing
        let runtime = start.elapsed();
        if let Some(remaining) = Duration::from_millis(log_interval).checked_sub(runtime) {
            thread::sleep(remaining);
        }
    }
}