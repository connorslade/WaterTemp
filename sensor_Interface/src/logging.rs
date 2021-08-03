use chrono::prelude::*;
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::thread;
use std::time::SystemTime;
use std::time::{Duration, Instant};

use super::common;
use super::sensor;

pub struct LogCfg {
    pub do_log: bool,
    pub file: String,
}

/// Start Data Logging.
/// Best to run this in a separate thread.
pub fn start_data_logging(log_file: &str, log_interval: i64, sensors: Vec<sensor::Sensor>) {
    // Open file
    // Will also create file if it does not exist
    let mut file = OpenOptions::new()
        .write(true)
        .append(true)
        .create(true)
        .open(log_file)
        .expect("Error opening file");

    let delay: u64 = log_interval as u64;

    loop {
        let start = Instant::now();

        let temp: f64 = sensors[0].get_temperature().unwrap();

        let epoch = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap();

        // More than one sensor
        if sensors.len() > 1 {
            let mut all_data: String = "".to_string();

            for i in 1..sensors.len() {
                all_data.push_str(&format!("{},", sensors[i].get_temperature().unwrap())[..]);
            }
            all_data = all_data[0..all_data.len() - 1].to_string();

            if let Err(e) = writeln!(file, "{:?},{},{}", epoch.as_secs(), temp, &all_data) {
                eprintln!("[-] Error writhing to file: {}", e);
            }
        }
        // Only One Sensor
        else {
            if let Err(e) = writeln!(file, "{:?},{}", epoch.as_secs(), temp) {
                eprintln!("[-] Error writhing to file: {}", e);
            }
        }

        // Fancy stuff to make sure this runs every 5 seconds
        // Not just 5 seconds after everything finished processing
        let runtime = start.elapsed();

        if let Some(remaining) = Duration::from_millis(delay).checked_sub(runtime) {
            thread::sleep(remaining);
        }
    }
}

/// Log Event to log file.
pub fn log_event(log_cfg: &LogCfg, event: String) {
    let mut log_file = log_cfg.file.clone();

    let now = Local::now();
    let date = now.format("%Y-%m-%d").to_string();
    let time = now.format("%H:%M:%S").to_string();
    log_file = log_file.replace('*', &date[..]);

    println!("{}", event);
    if !log_cfg.do_log {
        return;
    }

    let mut file = OpenOptions::new()
        .write(true)
        .append(true)
        .create(true)
        .open(log_file)
        .expect("Error opening file");

    let _ = writeln!(file, "[{}]: {}", time, common::remove_ansi(&event[..]));
}
