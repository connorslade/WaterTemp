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
pub fn start_data_logging(
    log_file: &str,
    log_interval: i64,
    debug: bool,
    dev_id: String,
    calibration: f64,
) {
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

        // let temp: f64 = sensor::get_temperature(&dev_id, debug, Some(calibration));
        let temp = 0.0;
        let epoch = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap();

        if let Err(e) = writeln!(file, "{:?},{}", epoch.as_secs(), temp) {
            eprintln!("Error writhing to file: {}", e);
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
