extern crate rand;
extern crate tiny_http;

use std::env;
use std::thread;
use simple_config_parser::config::Config;

mod common;
mod server;
mod logging;

/// Server Version
pub static VERSION: &str = "0.5";

/// Main entry point
fn main() {
    // Check for Run Args
    let args: Vec<String> = env::args().collect();
    let mut debug = args.iter().any(|i| i == "--debug");

    // Load config file
    let mut cfg = Config::new(Some("config.ini"));
    cfg.read().ok().expect("Error reading config file :/");

    // Get some config values
    let ip = &cfg.get("ip").unwrap()[..];
    let port = cfg.get("port").unwrap().parse::<u32>().unwrap();
    let dev_id = cfg.get("dev_id").unwrap();
    let logging = cfg.get_bool("logging").unwrap();
    let log_delay = cfg.get_int("log_delay").unwrap();
    let log_file = cfg.get("log_file").unwrap();
    let calibration = cfg.get_float("calibration").unwrap();
    debug = debug || cfg.get_bool("debug").unwrap();

    println!(
        "{} {} {} {}",
        common::color_bold("[*] Starting Sensor Interface", 32),
        common::color(&format!("[v{}]", VERSION)[..], 34),
        common::ret_if(logging, common::color_bold("LOGGING", 36)),
        common::ret_if(debug, common::color_bold("DEBUG", 31))
    );

    println!("{} {}",
        common::color("[*] Device ID:", 32),
        common::color(&dev_id.to_string()[..], 34)
    );
    
    println!(
        "{}{}",
        common::color("[*] Serving on: ", 32),
        common::color(&format!("{}:{}", ip, port)[..], 36)
    );

    // Start Logging thread
    if logging {
        thread::spawn(move || {
            logging::start_data_logging(&log_file[..], log_delay, debug, cfg.get("dev_id").unwrap(), calibration)
        });
    }

    // Start web server
    server::start(server::init(ip, port), debug, dev_id, calibration);
}
